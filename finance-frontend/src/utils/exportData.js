import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename) => {
  const csvData = data.map(item => ({
    Date: new Date(item.date).toLocaleDateString(),
    Category: item.category,
    Description: item.description || '-',
    Amount: `$${item.amount.toLocaleString()}`,
    Type: item.type,
  }));

  const ws = XLSX.utils.json_to_sheet(csvData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = async (data, filename) => {
  // You can implement PDF export using jsPDF or react-pdf
  console.log('PDF export coming soon');
};