import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ShareReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/report/${reportId}`);
        setReport(response.data);
      } catch (err) {
        setError('Report not found or has expired');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >=