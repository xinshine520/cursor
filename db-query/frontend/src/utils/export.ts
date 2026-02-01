import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table as DocTable, TableRow, TableCell, WidthType, TextRun } from 'docx';

/**
 * 导出查询结果为 Excel 文件
 */
export function exportToExcel(
  columns: string[],
  rows: Record<string, unknown>[],
  filename?: string
): void {
  if (!rows || rows.length === 0) {
    throw new Error('暂无数据，请查询数据后再导出!');
  }

  // 准备数据：第一行是列名，后续行是数据
  const data = [
    columns, // 表头
    ...rows.map((row) =>
      columns.map((col) => {
        const value = row[col];
        if (value === null || value === undefined) {
          return 'NULL';
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return String(value);
      })
    ),
  ];

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // 设置列宽
  const colWidths = columns.map((col) => ({
    wch: Math.max(col.length, 15), // 最小宽度 15
  }));
  ws['!cols'] = colWidths;

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '查询结果');

  // 生成文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFilename = `查询结果_${timestamp}.xlsx`;

  // 导出文件
  XLSX.writeFile(wb, filename || defaultFilename);
}

/**
 * 导出查询结果为 Word 文件
 */
export async function exportToWord(
  columns: string[],
  rows: Record<string, unknown>[],
  filename?: string
): Promise<void> {
  if (!rows || rows.length === 0) {
    throw new Error('暂无数据，请查询数据后再导出!');
  }

  // 格式化值
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // 创建表头行
  const headerRow = new TableRow({
    children: columns.map(
      (col) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: col,
                  bold: true,
                }),
              ],
            }),
          ],
          width: {
            size: 100 / columns.length,
            type: WidthType.PERCENTAGE,
          },
        })
    ),
  });

  // 创建数据行
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: columns.map(
          (col) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formatValue(row[col]),
                    }),
                  ],
                }),
              ],
              width: {
                size: 100 / columns.length,
                type: WidthType.PERCENTAGE,
              },
            })
        ),
      })
  );

  // 创建 Word 文档
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: '查询结果',
            heading: 'Heading1',
          }),
          new DocTable({
            rows: [headerRow, ...dataRows],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
        ],
      },
    ],
  });

  // 生成文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFilename = `查询结果_${timestamp}.docx`;

  // 导出文件
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
