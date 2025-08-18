import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FileDropzone from '../../components/FileDropzone'
import { parseFile, type FileExtractionResult } from '../../lib/parsing'

export default function DescribeStep() {
  const [text, setText] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<FileExtractionResult | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text')
  const navigate = useNavigate()
  
  const characterCount = text.length
  const isLargeInput = characterCount > 60000
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const examples = [
    {
      title: "E-commerce Platform",
      content: `Our e-commerce platform allows users to browse products, manage their shopping cart, and complete purchases. 

Key user journeys:
1. Product Discovery: Users search/browse products, view categories, read reviews
2. Shopping Cart: Add items to cart, update quantities, apply discount codes
3. Checkout: Guest or registered checkout, payment processing, order confirmation
4. Account Management: User registration, login, profile updates, order history
5. Customer Support: Help center, live chat, return requests

Error scenarios: Payment failures, out-of-stock items, network timeouts
Success metrics: Conversion rates, cart abandonment, repeat purchases`
    },
    {
      title: "SaaS Dashboard",
      content: `Our project management SaaS helps teams collaborate and track progress.

Key user workflows:
1. Project Setup: Create projects, invite team members, set permissions
2. Task Management: Create tasks, assign to team members, set due dates, update status
3. Collaboration: Comments, file attachments, @mentions, notifications  
4. Reporting: Generate reports, export data, view analytics dashboards
5. Administration: Billing management, user management, integrations

Critical events: Project creation, task completion, user invitations, subscription changes
Business metrics: Monthly active users, feature adoption, churn rate`
    },
    {
      title: "Mobile Banking App",
      content: `Mobile banking application for account management and financial transactions.

User journeys:
1. Authentication: Login with PIN/biometrics, security verification
2. Account Overview: View balances, transaction history, pending transactions
3. Money Transfer: Send money to contacts, pay bills, schedule transfers  
4. Card Management: View card details, block/unblock cards, set limits
5. Customer Service: Chat support, appointment booking, document upload

Security events: Failed login attempts, suspicious activity, device registration
Compliance tracking: Transaction limits, KYC verification, audit trails`
    }
  ]

  function useExample(content: string) {
    setText(content)
    setShowExamples(false)
    setInputMethod('text')
  }

  async function handleFileSelect(file: File) {
    setUploadedFile(file)
    setUploadError(null)
    setExtractedText(null)
    setIsExtracting(true)
    setInputMethod('file')

    try {
      const result = await parseFile(file)
      setExtractedText(result)
      
      if (result.warnings && result.warnings.length > 0) {
        console.warn('File parsing warnings:', result.warnings)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract text from file'
      setUploadError(errorMessage)
      setUploadedFile(null)
    } finally {
      setIsExtracting(false)
    }
  }

  function handleFileError(error: string) {
    setUploadError(error)
    setUploadedFile(null)
  }

  function clearFile() {
    setUploadedFile(null)
    setExtractedText(null)
    setUploadError(null)
    setInputMethod('text')
  }

  function onNext() {
    // TODO: In future, persist text/file to storage/context
    // For now, validate we have some input
    if (inputMethod === 'text' && !text.trim()) {
      alert('Please provide a product description or upload a file')
      return
    }
    if (inputMethod === 'file' && !extractedText) {
      alert('Please upload a file and wait for text extraction to complete')
      return
    }
    
    // Log the extracted content for debugging
    if (inputMethod === 'file' && extractedText) {
      console.log('Proceeding with extracted text:', extractedText.text.substring(0, 200) + '...')
    }
    
    navigate('/journeys')
  }

  return (
    <div className="content-section-lg">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Describe your product and journeys
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          Provide a clear description of your product with key user journeys and workflows. The AI will extract relevant events for analytics tracking.
        </p>
      </div>

      {/* AI Quality Expectations */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
        <h3 className="text-sm font-medium text-blue-900">💡 What to expect from AI analysis</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>✓ Good at:</strong> Identifying user actions, page views, form submissions, and error states</p>
          <p><strong>⚠️ May need review:</strong> Complex business logic, edge cases, and domain-specific terminology</p>
          <p><strong>📝 Always verify:</strong> Event names, properties, and business context before implementation</p>
        </div>
      </div>

      {/* Input Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">📋 Input tips for best results</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Include specific user actions (clicks, form fills, navigation)</li>
          <li>Describe error scenarios and edge cases</li>
          <li>Mention key business outcomes and conversion points</li>
          <li>Add context about user types and personas</li>
        </ul>
      </div>

      {/* Input Method Toggle */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Choose input method
        </h4>
        <div className="flex gap-4">
          <button
            onClick={() => setInputMethod('text')}
            className={`flex-1 p-3 text-sm font-medium rounded-md border transition-colors ${
              inputMethod === 'text'
                ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            ✏️ Type description
          </button>
          <button
            onClick={() => setInputMethod('file')}
            className={`flex-1 p-3 text-sm font-medium rounded-md border transition-colors ${
              inputMethod === 'file'
                ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            📄 Upload document
          </button>
        </div>
      </div>
      {/* Conditional Content Based on Input Method */}
      {inputMethod === 'text' && (
        <>
          {/* Example Templates */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Get started with an example
              </h4>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                aria-expanded={showExamples}
              >
                {showExamples ? 'Hide' : 'Show'} examples
              </button>
            </div>
            
            {showExamples && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {examples.map((example) => (
                  <button
                    key={example.title}
                    onClick={() => useExample(example.content)}
                    className="text-left p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                      {example.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                      {example.content.substring(0, 120)}...
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="space-y-2">
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Description & User Journeys
            </label>
            <textarea
              id="product-description"
              className="field-textarea w-full h-64 text-sm"
              placeholder="Describe your product, key user journeys, and important workflows. Include specific user actions, error scenarios, and business outcomes..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-describedby="character-count"
            />
            
            {/* Enhanced Character/Word Count */}
            <div 
              id="character-count"
              className="flex justify-between items-center text-xs"
            >
              <div className="text-gray-500 dark:text-gray-400">
                {wordCount} words • {characterCount} characters
              </div>
              <div className={`${isLargeInput ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {isLargeInput && '⚠️ '}
                {isLargeInput ? 'Large input will be chunked for processing' : 'Optimal length: 500-5000 characters'}
              </div>
            </div>
          </div>
        </>
      )}

      {inputMethod === 'file' && (
        <>
          {/* File Upload Area */}
          <div className="space-y-4">
            <FileDropzone
              onFileSelect={handleFileSelect}
              onError={handleFileError}
              maxSizeBytes={10 * 1024 * 1024} // 10MB
              disabled={isExtracting}
            />

            {/* Upload Error Display */}
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-sm">⚠️</span>
                  <div className="text-sm text-red-700">{uploadError}</div>
                </div>
              </div>
            )}

            {/* Extraction Progress */}
            {isExtracting && uploadedFile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      Extracting text from {uploadedFile.name}...
                    </div>
                    <div className="text-xs text-blue-700">
                      Processing {uploadedFile.type.includes('pdf') ? 'PDF' : uploadedFile.type.includes('word') ? 'Word document' : 'file'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Text Preview */}
            {extractedText && !isExtracting && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-lg">📄</span>
                    <div>
                      <div className="text-sm font-medium text-green-900">
                        {extractedText.metadata.originalFileName}
                      </div>
                      <div className="text-xs text-green-700">
                        {extractedText.metadata.wordCount} words • {extractedText.metadata.characterCount} characters
                        {extractedText.fileType === 'pdf' && extractedText.additionalMetadata?.pageCount && 
                          ` • ${extractedText.additionalMetadata.pageCount} pages`
                        }
                        {extractedText.additionalMetadata?.reductionPercentage && extractedText.additionalMetadata.reductionPercentage > 5 &&
                          ` • ${extractedText.additionalMetadata.reductionPercentage}% cleaned`
                        }
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
                
                {/* Text Preview */}
                <div className="mt-3 p-3 bg-white border border-green-200 rounded text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-green-600 font-medium">Processed Text Preview:</div>
                    {extractedText.needsChunking && (
                      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Large document - will be chunked for processing
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700 line-clamp-4 leading-relaxed">
                    {extractedText.cleanedText.length > 300 
                      ? extractedText.cleanedText.substring(0, 300) + '...'
                      : extractedText.cleanedText
                    }
                  </div>
                  
                  {/* Structure Info */}
                  {extractedText.structure.headings.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-green-100">
                      <div className="text-xs text-green-600 mb-1">Document Structure:</div>
                      <div className="text-xs text-gray-600">
                        {extractedText.structure.headings.length} headings • 
                        {extractedText.structure.sections.length} sections • 
                        {extractedText.structure.metadata.complexity} complexity •
                        {extractedText.structure.metadata.estimatedReadingTime} min read
                      </div>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {extractedText.warnings && extractedText.warnings.length > 0 && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                    <div className="font-medium text-amber-800 mb-1">Processing Notes:</div>
                    <ul className="text-amber-700 list-disc list-inside">
                      {extractedText.warnings.slice(0, 3).map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                      {extractedText.warnings.length > 3 && (
                        <li>... and {extractedText.warnings.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-2 text-xs text-green-700">
                  ✅ Text extraction completed successfully.
                </div>
              </div>
            )}
          </div>
        </>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button 
          className="w-full sm:w-auto px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white font-medium transition-colors"
          onClick={onNext}
        >
          Next: Journeys
        </button>
        <Link 
          to="/preview" 
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline transition-colors"
        >
          Skip to preview
        </Link>
      </div>
    </div>
  )
}


