import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Questionnaire {
  webhooks: boolean;
  sandbox_env: boolean;
  retries: boolean;
}

interface Coverage {
  matched: string[];
  close: Array<{ target: string; candidate: string; confidence: number }>;
  missing: string[];
}

interface RuleFinding {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
  explanation?: string;
}

interface AnalysisResult {
  reportId: string;
  scores: {
    data: number;
    coverage: number;
    rules: number;
    posture: number;
    overall: number;
  };
  coverage: Coverage;
  ruleFindings: RuleFinding[];
  gaps: string[];
  fieldSuggestions?: string[];
  ruleExplanations?: string[];
  mappingSkeleton?: any;
  meta: {
    rowsParsed: number;
    linesTotal: number;
    country: string;
    erp: string;
    db: string;
    analyzedAt: string;
  };
}

interface RecentReport {
  id: string;
  created_at: string;
  scores_overall: number;
  country: string;
  erp: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [country, setCountry] = useState('UAE');
  const [erp, setErp] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [showRecentReports, setShowRecentReports] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({ email: '', message: '' });
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    webhooks: false,
    sandbox_env: false,
    retries: false
  });

  // Load recent reports on mount
  useEffect(() => {
    loadRecentReports();
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadRecentReports = async () => {
    try {
      const response = await axios.get('https://e-invoicing-analyzer-j0q6.onrender.com/reports?limit=10');
      setRecentReports(response.data);
    } catch (error) {
      console.error('Failed to load recent reports:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('country', country);
    formData.append('erp', erp);

    console.log('🚀 Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      country,
      erp
    });

    try {
      const response = await axios.post('https://e-invoicing-analyzer-j0q6.onrender.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      console.log('✅ Upload successful:', response.data);
      
      if (response.data.uploadId) {
        const newUploadId = response.data.uploadId;
        setUploadId(newUploadId);
        
        // AUTOMATICALLY PROCEED TO ANALYSIS AFTER SUCCESSFUL UPLOAD
        console.log('🔍 Proceeding to analysis with uploadId:', newUploadId);
        await handleAnalyze(newUploadId);
      } else {
        throw new Error('No uploadId received from server');
      }
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      
      let errorMessage = 'Upload failed. ';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to backend server. Make sure it\'s running.';
      } else if (error.response) {
        errorMessage += `Server error (${error.response.status}): ${error.response.data?.error || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += 'No response received from server. Check if backend is running and accessible.';
      } else if (error.message.includes('timeout')) {
        errorMessage += 'Request timed out. The server is taking too long to respond.';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (analyzeUploadId?: string) => {
    const targetUploadId = analyzeUploadId || uploadId;
    
    if (!targetUploadId) {
      setError('No upload ID available. Please upload a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    console.log('🔍 Starting analysis for upload:', targetUploadId);
    console.log('📋 Questionnaire:', questionnaire);

    try {
      const response = await axios.post('https://e-invoicing-analyzer-j0q6.onrender.com/analyze', {
        uploadId: targetUploadId,
        questionnaire
      }, {
        timeout: 45000,
      });
      
      console.log('✅ Analysis successful:', response.data);
      setAnalysisResult(response.data);
      setCurrentStep(3);
      loadRecentReports(); // Refresh recent reports
    } catch (error: any) {
      console.error('❌ Analysis failed:', error);
      
      let errorMessage = 'Analysis failed. ';
      
      if (error.response) {
        errorMessage += `Server error (${error.response.status}): ${error.response.data?.error || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += 'No response from analysis server.';
      } else if (error.message.includes('timeout')) {
        errorMessage += 'Analysis timed out. The server is taking too long to process.';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'csv' && fileExtension !== 'json') {
        setError('Please select a CSV or JSON file.');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const copyShareableLink = async () => {
    if (!analysisResult) return;

    const shareableUrl = `${window.location.origin}/share/${analysisResult.reportId}`;
    
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopySuccess('Link copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess('Link copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const getShareableUrl = () => {
    if (!analysisResult) return '';
    return `${window.location.origin}/share/${analysisResult.reportId}`;
  };

  const handleEmailReport = async () => {
    if (!analysisResult || !emailData.email) return;

    try {
      await axios.post('https://e-invoicing-analyzer-j0q6.onrender.com/email-report', {
        reportId: analysisResult.reportId,
        email: emailData.email,
        message: emailData.message
      });

      setEmailDialog(false);
      setEmailData({ email: '', message: '' });
      setCopySuccess('Report emailed successfully!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to send email. Please check email configuration.');
    }
  };

  // Simple PDF generation using browser print
  const generatePDFReport = () => {
    window.print();
  };

  // Simple mapping template export
  const exportMappingTemplate = () => {
    if (!analysisResult?.mappingSkeleton) return;
    
    const mappingTemplate = JSON.stringify({
      name: "E-Invoicing Field Mapping Template",
      description: "Generated mapping template for GETS v0.1 compliance",
      version: "1.0",
      mappings: analysisResult.mappingSkeleton,
      generatedAt: new Date().toISOString(),
      instructions: [
        "1. Review suggested mappings",
        "2. Fill in missing source fields", 
        "3. Update confidence scores as needed",
        "4. Use this template in your integration"
      ]
    }, null, 2);
    
    const blob = new Blob([mappingTemplate], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mapping-template-${analysisResult.reportId}.json`;
    link.click();
  };

  const loadReport = async (reportId: string) => {
    try {
      const response = await axios.get(`https://e-invoicing-analyzer-j0q6.onrender.com/report/${reportId}`);
      setAnalysisResult(response.data);
      setCurrentStep(3);
      setShowRecentReports(false);
    } catch (error) {
      setError('Failed to load report');
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              E-Invoicing Readiness Analyzer
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Analyze your invoice data against GETS v0.1 standards
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Recent Reports Button */}
            <button
              onClick={() => setShowRecentReports(!showRecentReports)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Recent Reports"
            >
              📋
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Recent Reports Sidebar */}
        {showRecentReports && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-96 bg-white dark:bg-gray-800 h-full overflow-y-auto animate-slide-up">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Reports
                  </h2>
                  <button
                    onClick={() => setShowRecentReports(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => loadReport(report.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {report.erp} - {report.country}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          getScoreColor(report.scores_overall)
                        }`}>
                          {report.scores_overall}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {recentReports.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No recent reports found
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Dialog */}
        {emailDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Email Report
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="recipient@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add a personal message..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEmailDialog(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailReport}
                  disabled={!emailData.email}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copy Success Message */}
        {copySuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-400">✅</span>
              </div>
              <div className="ml-3">
                <div className="text-sm text-green-700 dark:text-green-300">
                  {copySuccess}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Context */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Context Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="UAE">UAE</option>
                  <option value="KSA">KSA</option>
                  <option value="MY">Malaysia</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Country-specific rules will be applied during analysis
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ERP System
                </label>
                <input
                  type="text"
                  value={erp}
                  onChange={(e) => setErp(e.target.value)}
                  placeholder="e.g., SAP, Oracle, Custom"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!erp.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Data</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-gray-600 dark:text-gray-400">
                    {file ? (
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Selected: {file.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Size: {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg">📁 Drag and drop your CSV or JSON file here</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          or click to browse (max 5MB)
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Supported formats: .csv, .json
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Questionnaire */}
              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Technical Capabilities
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'webhooks', label: 'Webhooks Support' },
                    { key: 'sandbox_env', label: 'Sandbox Environment' },
                    { key: 'retries', label: 'Automatic Retries' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={questionnaire[item.key as keyof Questionnaire]}
                        onChange={(e) =>
                          setQuestionnaire({
                            ...questionnaire,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setError(null);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!file || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {currentStep === 2 ? 'Uploading & Analyzing...' : 'Processing...'}
                    </span>
                  ) : (
                    'Upload & Analyze'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && analysisResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analysis Results</h2>
            
            {/* Scores */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { key: 'overall', label: 'Overall', value: analysisResult.scores.overall },
                { key: 'data', label: 'Data', value: analysisResult.scores.data },
                { key: 'coverage', label: 'Coverage', value: analysisResult.scores.coverage },
                { key: 'rules', label: 'Rules', value: analysisResult.scores.rules },
                { key: 'posture', label: 'Posture', value: analysisResult.scores.posture },
              ].map((score) => (
                <div key={score.key} className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(score.value)} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2`}>
                    {score.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{score.label}</div>
                </div>
              ))}
            </div>

            {/* Coverage */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Field Coverage</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analysisResult.coverage.matched.length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Matched</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {analysisResult.coverage.close.length}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Close</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analysisResult.coverage.missing.length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Missing</div>
                </div>
              </div>
            </div>

            {/* P1: AI-Lite Suggestions */}
            {analysisResult.fieldSuggestions && analysisResult.fieldSuggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Field Mapping Suggestions
                </h3>
                <div className="space-y-2">
                  {analysisResult.fieldSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <span className="text-blue-700 dark:text-blue-300 text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rule Findings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Rule Validation</h3>
              <div className="space-y-2">
                {analysisResult.ruleFindings.map((rule, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      rule.ok 
                        ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex-1">
                      <span className={`font-medium ${
                        rule.ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                      }`}>
                        {rule.rule}
                      </span>
                      {rule.explanation && !rule.ok && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rule.explanation}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.ok
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {rule.ok ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            {analysisResult.gaps && analysisResult.gaps.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Identified Gaps</h3>
                <div className="space-y-2">
                  {analysisResult.gaps.map((gap, index) => (
                    <div key={index} className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <span className="text-yellow-700 dark:text-yellow-300 text-sm">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shareable Link Section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">Share Report</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Share this analysis with your team or stakeholders
              </p>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  readOnly
                  value={getShareableUrl()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  placeholder="Shareable link will appear here"
                />
                <button
                  onClick={copyShareableLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
                >
                  📋 Copy Link
                </button>
              </div>
              
              {/* P2: Additional Export Options */}
              <div className="flex space-x-2">
                <button
                  onClick={generatePDFReport}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  📄 PDF Report
                </button>
                
                <button
                  onClick={exportMappingTemplate}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  🗺️ Mapping Template
                </button>
                
                <button
                  onClick={() => setEmailDialog(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  📧 Email Report
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setAnalysisResult(null);
                  setFile(null);
                  setUploadId('');
                  setError(null);
                  setCopySuccess('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                New Analysis
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(analysisResult, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `e-invoicing-report-${analysisResult.reportId}.json`;
                  link.click();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Download JSON Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
