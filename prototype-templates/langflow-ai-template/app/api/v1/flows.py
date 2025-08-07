"""
LangFlow API endpoints for managing AI flows and executions.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.services.langflow_service import LangFlowService

router = APIRouter(prefix="/flows", tags=["flows"])
settings = get_settings()


class FlowRequest(BaseModel):
    """Request model for executing a flow."""
    
    flow_id: str = Field(..., description="ID of the flow to execute")
    inputs: Dict[str, Any] = Field(default={}, description="Input values for the flow")
    stream: bool = Field(default=False, description="Whether to stream the response")


class FlowResponse(BaseModel):
    """Response model for flow execution."""
    
    execution_id: str = Field(..., description="Unique execution ID")
    flow_id: str = Field(..., description="ID of the executed flow")
    status: str = Field(..., description="Execution status")
    outputs: Optional[Dict[str, Any]] = Field(None, description="Flow outputs")
    error: Optional[str] = Field(None, description="Error message if execution failed")


class FlowListItem(BaseModel):
    """Model for flow list items."""
    
    id: str = Field(..., description="Flow ID")
    name: str = Field(..., description="Flow name")
    description: Optional[str] = Field(None, description="Flow description")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")


@router.get("/", response_model=List[FlowListItem])
async def list_flows(
    langflow_service: LangFlowService = Depends()
) -> List[FlowListItem]:
    """
    Get list of available flows.
    
    Returns:
        List of available flows with metadata
    """
    try:
        flows = await langflow_service.list_flows()
        return flows
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list flows: {str(e)}"
        )


@router.get("/{flow_id}", response_model=Dict[str, Any])
async def get_flow(
    flow_id: str,
    langflow_service: LangFlowService = Depends()
) -> Dict[str, Any]:
    """
    Get flow details by ID.
    
    Args:
        flow_id: The flow identifier
        
    Returns:
        Flow configuration and metadata
    """
    try:
        flow = await langflow_service.get_flow(flow_id)
        if not flow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Flow {flow_id} not found"
            )
        return flow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get flow: {str(e)}"
        )


@router.post("/execute", response_model=FlowResponse)
async def execute_flow(
    request: FlowRequest,
    background_tasks: BackgroundTasks,
    langflow_service: LangFlowService = Depends()
) -> FlowResponse:
    """
    Execute a LangFlow flow.
    
    Args:
        request: Flow execution request
        background_tasks: Background task manager
        
    Returns:
        Flow execution response
    """
    execution_id = str(uuid4())
    
    try:
        if request.stream:
            # Start streaming execution in background
            background_tasks.add_task(
                langflow_service.execute_flow_streaming,
                execution_id,
                request.flow_id,
                request.inputs
            )
            
            return FlowResponse(
                execution_id=execution_id,
                flow_id=request.flow_id,
                status="streaming",
                outputs=None
            )
        else:
            # Execute synchronously
            result = await langflow_service.execute_flow(
                request.flow_id,
                request.inputs
            )
            
            return FlowResponse(
                execution_id=execution_id,
                flow_id=request.flow_id,
                status="completed",
                outputs=result
            )
            
    except Exception as e:
        return FlowResponse(
            execution_id=execution_id,
            flow_id=request.flow_id,
            status="failed",
            outputs=None,
            error=str(e)
        )


@router.get("/executions/{execution_id}", response_model=FlowResponse)
async def get_execution_status(
    execution_id: str,
    langflow_service: LangFlowService = Depends()
) -> FlowResponse:
    """
    Get execution status and results.
    
    Args:
        execution_id: Execution identifier
        
    Returns:
        Execution status and results
    """
    try:
        execution = await langflow_service.get_execution(execution_id)
        if not execution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Execution {execution_id} not found"
            )
        return execution
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get execution status: {str(e)}"
        )


@router.post("/upload-documents")
async def upload_documents(
    files: List[str] = Field(..., description="List of file paths to process"),
    langflow_service: LangFlowService = Depends()
) -> Dict[str, Any]:
    """
    Upload and process documents for RAG applications.
    
    Args:
        files: List of file paths to process
        
    Returns:
        Processing results and document IDs
    """
    try:
        result = await langflow_service.process_documents(files)
        return {
            "status": "success",
            "processed_files": len(files),
            "document_ids": result.get("document_ids", []),
            "message": "Documents processed successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process documents: {str(e)}"
        )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    langflow_service: LangFlowService = Depends()
) -> Dict[str, str]:
    """
    Delete a processed document.
    
    Args:
        document_id: Document identifier
        
    Returns:
        Deletion confirmation
    """
    try:
        await langflow_service.delete_document(document_id)
        return {
            "status": "success",
            "message": f"Document {document_id} deleted successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )