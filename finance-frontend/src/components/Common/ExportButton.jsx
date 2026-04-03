import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader } from 'lucide-react';
import { exportTransactionsToCSV, exportSummaryToCSV } from '../../services/api';
import toast from 'react-hot-toast';

const ExportButton = ({ type, filters, variant = 'primary' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (exportType, format = 'csv') => {
    setIsExporting(true);
    try {
      let response;
      
      if (exportType === 'transactions') {
        response = await exportTransactionsToCSV(filters);
      } else if (exportType === 'summary') {
        response = await exportSummaryToCSV(filters);
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match && match[1]) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${exportType === 'transactions' ? 'Transactions' : 'Summary'} exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const buttonVariants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className={`${buttonVariants[variant]} flex items-center space-x-2`}
      >
        {isExporting ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>Export</span>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={() => handleExport('transactions', 'csv')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span>Export Transactions (CSV)</span>
              </button>
              <button
                onClick={() => handleExport('summary', 'csv')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Export Summary Report (CSV)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;