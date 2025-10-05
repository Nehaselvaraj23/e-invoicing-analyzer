import React, { useCallback, useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { uploadFile } from '../services/api';

const UploadStep: React.FC = () => {
  const { state, dispatch } = useAnalysis();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    const validTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !['csv', 'json'].includes(fileExtension || '')) {
      dispatch({ type: 'SET_ERROR', payload: 'Please upload a CSV or JSON file' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const uploadResponse = await uploadFile(file, state.context.country, state.context.erp);
      dispatch({ type: 'SET_UPLOAD_DATA', payload: uploadResponse });
      dispatch({ type: 'SET_STEP', payload: 2 });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Upload failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Invoice Data</h2>
      <p className="text-gray-600 mb-6">
        Upload your invoice data in CSV or JSON format. We'll analyze it against the GETS v0.1 standard.
      </p>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
        } ${state.loading ? 'opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {state.loading ? 'Uploading...' : 'Drag and drop your file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports CSV and JSON files up to 5MB
            </p>
          </div>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.json,text/csv,application/json"
            onChange={handleChange}
            disabled={state.loading}
          />
          <label
            htmlFor="file-upload"
            className="btn-primary inline-block cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose File
          </label>
        </div>
      </div>

      {state.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{state.error}</p>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sample Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Clean Sample</h4>
            <p className="text-sm text-gray-500 mt-1">Well-formatted invoice data that should pass most validations</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Flawed Sample</h4>
            <p className="text-sm text-gray-500 mt-1">Contains common issues like invalid dates and currencies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStep;