import React from 'react';
import { 
  DocumentArrowDownIcon,
  TableCellsIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const ExportButtons = ({ 
  onExportPDF, 
  onExportExcel, 
  onPrint,
  loading = false,
  disabled = false 
}) => {
  const buttons = [
    {
      label: 'Exportar PDF',
      icon: DocumentArrowDownIcon,
      onClick: onExportPDF,
      className: 'bg-red-600 hover:bg-red-700 text-white'
    },
    {
      label: 'Exportar Excel',
      icon: TableCellsIcon,
      onClick: onExportExcel,
      className: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      label: 'Imprimir',
      icon: PrinterIcon,
      onClick: onPrint,
      className: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ];

  return (
    <div className="flex items-center space-x-2">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          disabled={loading || disabled}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${button.className}`}
        >
          <button.icon className="w-4 h-4 mr-2" />
          {loading ? 'Procesando...' : button.label}
        </button>
      ))}
    </div>
  );
};

export default ExportButtons;
