"""
LangFlow service for managing AI flows and document processing.
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from pathlib import Path

import httpx
from langchain.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.logging import logger


class LangFlowService:
    """Service for managing LangFlow operations."""
    
    def __init__(self):
        self.settings = get_settings()
        self.langflow_url = getattr(self.settings, 'LANGFLOW_URL', 'http://localhost:7860')
        self.vector_store_path = "./vector_store"
        self.documents_path = "./documents"
        self.flows_path = "./flows"
        
        # Ensure directories exist
        os.makedirs(self.vector_store_path, exist_ok=True)
        os.makedirs(self.documents_path, exist_ok=True)
        os.makedirs(self.flows_path, exist_ok=True)
        
        # Initialize embeddings
        self.embeddings = OpenAIEmbeddings()
        
        # In-memory execution tracking
        self.executions: Dict[str, Dict[str, Any]] = {}
    
    async def list_flows(self) -> List[Dict[str, Any]]:
        """
        List available flows.
        
        Returns:
            List of flow metadata
        """
        flows = []
        
        # Check for local flow files
        flow_files = Path(self.flows_path).glob("*.json")
        for flow_file in flow_files:
            try:
                with open(flow_file, 'r') as f:
                    flow_data = json.load(f)
                    
                flows.append({
                    "id": flow_file.stem,
                    "name": flow_data.get("name", flow_file.stem),
                    "description": flow_data.get("description", ""),
                    "created_at": datetime.fromtimestamp(flow_file.stat().st_ctime).isoformat(),
                    "updated_at": datetime.fromtimestamp(flow_file.stat().st_mtime).isoformat()
                })
            except Exception as e:
                logger.error(f"Failed to load flow {flow_file}: {e}")
        
        # Add default sample flows if none exist
        if not flows:
            flows = [
                {
                    "id": "chat-basic",
                    "name": "Basic Chat",
                    "description": "Simple conversational AI flow",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": "rag-qa",
                    "name": "RAG Q&A",
                    "description": "Retrieval-Augmented Generation for document Q&A",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": "document-summary",
                    "name": "Document Summarization",
                    "description": "Summarize uploaded documents",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            ]
        
        return flows
    
    async def get_flow(self, flow_id: str) -> Optional[Dict[str, Any]]:
        """
        Get flow configuration by ID.
        
        Args:
            flow_id: Flow identifier
            
        Returns:
            Flow configuration or None if not found
        """
        flow_file = Path(self.flows_path) / f"{flow_id}.json"
        
        if flow_file.exists():
            try:
                with open(flow_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load flow {flow_id}: {e}")
                return None
        
        # Return sample flow configurations
        sample_flows = {
            "chat-basic": {
                "id": "chat-basic",
                "name": "Basic Chat",
                "description": "Simple conversational AI flow",
                "components": [
                    {
                        "id": "chat_input",
                        "type": "TextInput",
                        "data": {"text": ""}
                    },
                    {
                        "id": "llm",
                        "type": "OpenAI",
                        "data": {"model_name": "gpt-3.5-turbo"}
                    },
                    {
                        "id": "chat_output",
                        "type": "TextOutput",
                        "data": {"text": ""}
                    }
                ]
            },
            "rag-qa": {
                "id": "rag-qa",
                "name": "RAG Q&A",
                "description": "Retrieval-Augmented Generation for document Q&A",
                "components": [
                    {
                        "id": "question_input",
                        "type": "TextInput",
                        "data": {"text": ""}
                    },
                    {
                        "id": "vector_store",
                        "type": "ChromaDB",
                        "data": {"collection_name": "documents"}
                    },
                    {
                        "id": "retriever",
                        "type": "VectorStoreRetriever",
                        "data": {"k": 3}
                    },
                    {
                        "id": "llm",
                        "type": "OpenAI",
                        "data": {"model_name": "gpt-4"}
                    },
                    {
                        "id": "answer_output",
                        "type": "TextOutput",
                        "data": {"text": ""}
                    }
                ]
            }
        }
        
        return sample_flows.get(flow_id)
    
    async def execute_flow(self, flow_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a flow synchronously.
        
        Args:
            flow_id: Flow identifier
            inputs: Input values
            
        Returns:
            Flow execution results
        """
        logger.info(f"Executing flow {flow_id} with inputs: {inputs}")
        
        # Simulate different flow executions
        if flow_id == "chat-basic":
            return await self._execute_chat_flow(inputs)
        elif flow_id == "rag-qa":
            return await self._execute_rag_flow(inputs)
        elif flow_id == "document-summary":
            return await self._execute_summary_flow(inputs)
        else:
            # Try to execute via LangFlow API if running
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.langflow_url}/api/flows/{flow_id}/run",
                        json={"inputs": inputs},
                        timeout=30.0
                    )
                    response.raise_for_status()
                    return response.json()
            except Exception as e:
                logger.error(f"Failed to execute flow via LangFlow API: {e}")
                return {
                    "error": f"Flow {flow_id} not found and LangFlow not available",
                    "available_flows": ["chat-basic", "rag-qa", "document-summary"]
                }
    
    async def execute_flow_streaming(self, execution_id: str, flow_id: str, inputs: Dict[str, Any]):
        """
        Execute a flow with streaming (background task).
        
        Args:
            execution_id: Execution identifier
            flow_id: Flow identifier
            inputs: Input values
        """
        try:
            # Update execution status
            self.executions[execution_id] = {
                "flow_id": flow_id,
                "status": "running",
                "outputs": None,
                "error": None,
                "started_at": datetime.now().isoformat()
            }
            
            # Execute flow
            result = await self.execute_flow(flow_id, inputs)
            
            # Update execution with results
            self.executions[execution_id].update({
                "status": "completed",
                "outputs": result,
                "completed_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.executions[execution_id].update({
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now().isoformat()
            })
    
    async def get_execution(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """
        Get execution status and results.
        
        Args:
            execution_id: Execution identifier
            
        Returns:
            Execution information or None if not found
        """
        execution = self.executions.get(execution_id)
        if not execution:
            return None
            
        return {
            "execution_id": execution_id,
            "flow_id": execution["flow_id"],
            "status": execution["status"],
            "outputs": execution["outputs"],
            "error": execution["error"]
        }
    
    async def process_documents(self, file_paths: List[str]) -> Dict[str, Any]:
        """
        Process documents for RAG applications.
        
        Args:
            file_paths: List of file paths to process
            
        Returns:
            Processing results
        """
        processed_docs = []
        document_ids = []
        
        for file_path in file_paths:
            try:
                # Load document based on file type
                if file_path.endswith('.pdf'):
                    loader = PyPDFLoader(file_path)
                elif file_path.endswith('.docx'):
                    loader = Docx2txtLoader(file_path)
                else:
                    loader = TextLoader(file_path)
                
                documents = loader.load()
                
                # Split documents
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    length_function=len
                )
                
                split_docs = text_splitter.split_documents(documents)
                processed_docs.extend(split_docs)
                
                # Generate document ID
                doc_id = f"doc_{len(document_ids)}"
                document_ids.append(doc_id)
                
                logger.info(f"Processed {len(split_docs)} chunks from {file_path}")
                
            except Exception as e:
                logger.error(f"Failed to process {file_path}: {e}")
        
        # Store in vector database
        if processed_docs:
            vector_store = Chroma(
                persist_directory=self.vector_store_path,
                embedding_function=self.embeddings
            )
            
            vector_store.add_documents(processed_docs)
            vector_store.persist()
        
        return {
            "document_ids": document_ids,
            "chunks_processed": len(processed_docs),
            "files_processed": len([f for f in file_paths if any(doc for doc in processed_docs)])
        }
    
    async def delete_document(self, document_id: str):
        """
        Delete a document from the vector store.
        
        Args:
            document_id: Document identifier
        """
        # This would require implementing document ID tracking in a real system
        logger.info(f"Document {document_id} deletion requested")
        # For now, just log the request
    
    async def _execute_chat_flow(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a basic chat flow."""
        message = inputs.get("message", inputs.get("text", "Hello"))
        
        # Simulate AI response
        response = f"AI Response to: {message}\\n\\nThis is a simulated response from the chat flow. In a real implementation, this would connect to your preferred LLM."
        
        return {
            "response": response,
            "message_count": 1,
            "flow_type": "chat"
        }
    
    async def _execute_rag_flow(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a RAG Q&A flow."""
        question = inputs.get("question", inputs.get("text", "What is this about?"))
        
        try:
            # Load vector store
            vector_store = Chroma(
                persist_directory=self.vector_store_path,
                embedding_function=self.embeddings
            )
            
            # Search for relevant documents
            docs = vector_store.similarity_search(question, k=3)
            
            if docs:
                context = "\\n\\n".join([doc.page_content for doc in docs])
                answer = f"Based on the documents, here's what I found about '{question}':\\n\\n{context[:500]}..."
            else:
                answer = "No relevant documents found. Please upload some documents first using the /flows/upload-documents endpoint."
            
        except Exception as e:
            answer = f"Error accessing documents: {str(e)}. Make sure to upload documents first."
        
        return {
            "answer": answer,
            "question": question,
            "sources_found": len(docs) if 'docs' in locals() else 0,
            "flow_type": "rag"
        }
    
    async def _execute_summary_flow(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a document summarization flow."""
        document_text = inputs.get("document", inputs.get("text", "No document provided"))
        
        # Simulate document summarization
        summary = f"Summary of document (first 100 chars): {document_text[:100]}..."
        
        return {
            "summary": summary,
            "original_length": len(document_text),
            "summary_length": len(summary),
            "flow_type": "summary"
        }