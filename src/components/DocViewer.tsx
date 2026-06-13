import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { X, Download, Printer, ZoomIn, ZoomOut, BookOpen, AlertCircle, Sparkles, FileText } from 'lucide-react';

interface DocViewerProps {
  document: DocumentItem;
  onClose: () => void;
}

export default function DocViewer({ document, onClose }: DocViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handlePrint = () => {
    if (document.pdfFileUrl) {
      // If it's an uploaded PDF, open it in a new tab so the user can use native browser print/save
      const printWindow = window.open();
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${document.title}</title>
              <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${document.pdfFileUrl}"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      return;
    }

    // Generate an elegant print window that formats the summary as a professional school sheet mirroring screen layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${document.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;850&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            line-height: 1.8;
            padding: 30px;
            color: #1e293b;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 25px;
          }
          .ministry-title {
            font-size: 11px;
            color: #64748b;
          }
          .subject-title {
            font-size: 13px;
            font-weight: bold;
            color: #0369a1;
          }
          .grade-tag {
            font-weight: bold;
            color: #0f172a;
            background: #f1f5f9;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            border: 1px solid #cbd5e1;
          }
          .banner-box {
            background-color: #f0f9ff;
            border-right: 5px solid #0284c7;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 25px;
          }
          .unit-title {
            font-weight: bold;
            color: #0369a1;
            font-size: 13px;
          }
          .main-title {
            color: #0f172a;
            font-size: 20px;
            font-weight: 800;
            margin: 8px 0;
          }
          .desc-text {
            font-size: 13px;
            color: #475569;
            margin-top: 5px;
            font-style: italic;
          }
          .content-item {
            font-size: 14px;
            color: #334155;
            margin-bottom: 15px;
            padding-right: 20px;
            position: relative;
          }
          .content-item::before {
            content: "✓";
            color: #0284c7;
            font-weight: bold;
            position: absolute;
            right: 0;
            top: 0;
          }
          .heading-line {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 4px;
            margin-top: 25px;
            margin-bottom: 15px;
          }
          .warning-box {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 35px;
            font-size: 12px;
            color: #78350f;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          @media print {
            body { padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <div class="subject-title">مادة تكنولوجيا المعلومات والاتصالات (ICT)</div>
          </div>
          <div class="grade-tag">
            ${document.gradeLevel === '1st' ? 'الصف الأول الثانوي' : 'الصف الثاني الثانوي'}
          </div>
        </div>
        
        <div class="banner-box">
          <div class="unit-title">محور الدراسة: ${document.unit}</div>
          <h1 class="main-title">${document.title}</h1>
          <div class="desc-text">وصف المستند: ${document.description}</div>
        </div>

        <div>
          ${document.content.map(point => {
            const isSubHeader = point.trim().startsWith('-') || point.trim().includes('أبرز أنواع') || point.trim().includes('أهم مكونات') || point.trim().includes('أنواع البرمجيات') || point.trim().includes('إستراتيجيات الدفاع') || point.trim().includes('عناصر الإدخال') || point.trim().includes('وظائف لغة') || point.trim().includes('شرح المتغيرات');
            if (isSubHeader) {
              return `<div class="heading-line">${point.replaceAll('-', '').trim()}</div>`;
            }
            return `<div class="content-item">${point}</div>`;
          }).join('')}
        </div>

        <div class="warning-box">
          <strong>نصيحة الأستاذة ريم للاستذكار:</strong> نقترح مراجعة هذه النقاط وإثراء معلوماتكم عبر التطبيق العملي للوسائط والبرامج المطلوبة والتأكد من مطابقة الكود والحلول قبل الاختبارات.
        </div>

        <div class="footer">
          جميع الحقوق محفوظة للمنصة التعليمية لتكنولوجيا المعلومات والاتصالات &copy; 2026/2027
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (document.pdfFileUrl) {
      // Download the teacher's original uploaded PDF file
      const link = window.document.createElement('a');
      link.href = document.pdfFileUrl;
      link.download = document.pdfFileName || `${document.title}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      return;
    }

    // Generates a local download of HTML or text-formatted sheet
    const formattedContent = `
=============================================
منصة تكنولوجيا المعلومات والاتصالات
${document.gradeLevel === '1st' ? 'الصف الأول الثانوي' : 'الصف الثاني الثانوي'}
=============================================
العنوان: ${document.title}
الموضوع: ${document.unit}
نوع المستند: ${document.type === 'summary' ? 'ملخص تعليمي مفصل' : 'واجب منزلي وتطبيق'}
تاريخ الإضافة: ${document.createdAt}
---------------------------------------------
الوصف: ${document.description}
---------------------------------------------

${document.content.map((bullet, idx) => `${idx + 1}. ${bullet}`).join('\n\n')}

---------------------------------------------
تم هذا التنزيل من منصة الأستاذة ريم الرقمية لتكنولوجيا المعلومات والاتصالات والذكاء الاصطناعي.
    `;
    const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative bg-slate-900 text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] overflow-hidden border border-slate-700">
        
        {/* Document Viewer Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${document.type === 'summary' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <BookOpen size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                {document.pdfFileUrl ? 'ملف PDF منسق' : (document.type === 'summary' ? 'ملخص دراسي' : 'واجب دراسي')}
              </span>
              <h3 className="text-md font-bold mt-1 text-slate-100 line-clamp-1">{document.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="p-2 bg-slate-850 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 flex items-center gap-2 text-sm px-3 cursor-pointer"
              title={document.pdfFileUrl ? "تحميل ملف الـ PDF المرفق" : "تحميل مادة المذكرة"}
            >
              <Download size={16} />
              <span className="hidden sm:inline">{document.pdfFileUrl ? 'تحميل ملف PDF' : 'تحميل ملخص'}</span>
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 bg-slate-850 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 flex items-center gap-2 text-sm px-3 cursor-pointer"
              title="طباعة أو حفظ كملف PDF بالتنسيق الأصلي"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">طباعة / PDF</span>
            </button>
            
            <span className="h-6 w-px bg-slate-700 mx-1"></span>

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between px-6 py-2 bg-slate-800/50 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span><strong>الصف الدراسي:</strong> {document.gradeLevel === '1st' ? 'الصف الأول الثانوي' : 'الصف الثاني الثانوي'}</span>
            <span className="hidden sm:inline">|</span>
            <span><strong>المحور:</strong> {document.unit}</span>
          </div>
          {!document.pdfFileUrl && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setZoom(Math.max(50, zoom - 10))} 
                className="p-1 hover:bg-slate-700 rounded-md cursor-pointer"
                disabled={zoom <= 50}
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-1 text-slate-300 min-w-10 text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-1 hover:bg-slate-700 rounded-md cursor-pointer"
                disabled={zoom >= 150}
              >
                <ZoomIn size={14} />
              </button>
            </div>
          )}
          {document.pdfFileUrl && (
            <div className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
              <Sparkles size={12} className="animate-pulse" />
              <span>مستند PDF رقمي منسق بالكامل</span>
            </div>
          )}
        </div>

        {/* Paper Container Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8 flex justify-center">
          {document.pdfFileUrl ? (
            /* If the teacher uploaded an actual PDF file, render a majestic, high-fidelity, interactive PDF reader! */
            <div className="w-full max-w-4xl flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center border border-red-500/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">ملف الـ PDF المرفق من قبل الأستاذة ريم:</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{document.pdfFileName || 'document_uploaded.pdf'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={document.pdfFileUrl}
                    download={document.pdfFileName || `${document.title}.pdf`}
                    className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download size={13} />
                    <span>تنزيل ملف الـ PDF</span>
                  </a>
                  <button 
                    onClick={handlePrint}
                    className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
                  >
                    طباعة مباشرة
                  </button>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div className="flex-1 bg-white rounded-xl overflow-hidden border border-slate-800 flex flex-col min-h-[480px]">
                <embed 
                  src={document.pdfFileUrl}
                  type="application/pdf"
                  className="w-full h-full min-h-[450px]"
                />
                
                {/* Fallback helper in case frame block exists in sandbox inside iframe limits */}
                <div className="bg-slate-900 p-3 text-center border-t border-slate-800 text-[11px] text-slate-400">
                  ⚠️ إذا لم يظهر عرض ملف الـ PDF المكتوب تلقائياً في متصفحك، يمكنك استخدام زر <strong>"تنزيل ملف الـ PDF"</strong> لحفظه بجهازك وقراءته بأعلى جودة وتنسيق للأستاذة ريم!
                </div>
              </div>
            </div>
          ) : (
            /* Otherwise, render the gorgeous custom-styled interactive paper matching the customized request */
            <div 
              style={{ fontSize: `${(zoom / 100) * 16}px` }}
              className="w-full max-w-3xl bg-white text-slate-800 p-8 md:p-12 rounded-lg shadow-xl border border-slate-200 relative transition-all duration-300 select-text"
            >
              {/* Standard Academic Header Style Inside Leaflet */}
              <div className="flex justify-between items-center border-b-2 border-sky-600 pb-4 mb-6">
                <div className="text-right">
                  <span className="text-sky-700 font-bold block text-sm">مادة تكنولوجيا المعلومات والاتصالات (ICT)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-extrabold text-slate-800 tracking-wider text-sm bg-slate-100 px-3 py-1 rounded-md border border-slate-300">
                    {document.gradeLevel === '1st' ? 'الصف الأول الثانوي' : 'الصف الثاني الثانوي'}
                  </span>
                </div>
              </div>

              {/* Document Decorative Banner */}
              <div className="mb-6 bg-sky-50 border-r-4 border-sky-500 p-4 rounded-l-md">
                <div className="flex items-center gap-2 text-sky-800 font-bold mb-1">
                  <Sparkles size={16} />
                  <span>محور الدراسة: {document.unit}</span>
                </div>
                <h1 className="text-lg md:text-xl font-extrabold text-slate-900 mt-1">{document.title}</h1>
                <p className="text-slate-500 text-xs mt-2 italic leading-relaxed">
                  مذكرة صفية شاملة من إعداد منصة الأستاذة ريم الرقمية لتكنولوجيا المعلومات، مساعدة للتدريب والتهيئة للاختبارات الشهرية والنهائية.
                </p>
              </div>

              {/* Simulated Paper Elements List */}
              <div className="space-y-6 leading-relaxed">
                {document.content.map((point, index) => {
                  const isSubHeader = point.trim().startsWith('-') || point.trim().includes('أبرز أنواع') || point.trim().includes('أهم مكونات') || point.trim().includes('أنواع البرمجيات') || point.trim().includes('إستراتيجيات الدفاع') || point.trim().includes('عناصر الإدخال') || point.trim().includes('وظائف لغة') || point.trim().includes('شرح المتغيرات');
                  
                  if (isSubHeader) {
                    return (
                      <h3 key={index} className="text-slate-900 font-bold border-b border-dashed border-slate-300 pb-1 mt-6 text-md flex items-center gap-2">
                        <span className="w-2 h-2 bg-sky-500 rounded-full inline-block"></span>
                        {point.replaceAll('-', '').trim()}
                      </h3>
                    );
                  }
                  
                  return (
                    <p key={index} className="text-slate-700 text-sm whitespace-pre-wrap pr-4 relative">
                      <span className="absolute right-0 top-1 text-sky-500 font-bold text-xs">✓</span>
                      {point}
                    </p>
                  );
                })}
              </div>

              {/* Warning / Tips notice at bottom */}
              <div className="mt-12 p-3 bg-amber-50 border border-amber-250 rounded-lg flex gap-3 text-xs text-amber-900 leading-relaxed">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>نصيحة الأستاذة ريم للاستذكار:</strong> نقترح مراجعة هذه النقاط وإثراء معلوماتكم عبر التطبيق العملي للوسائط والبرامج المطلوبة (مثل حزمة الأوفيس، ومترجمات الويب XAMPP) والتأكد من مطابقة الكود والحلول قبل الاختبارات.
                </div>
              </div>

              <div className="border-t border-slate-200 mt-10 pt-4 text-center text-xs text-slate-400">
                جميع الحقوق محفوظة للمنصة التعليمية لتكنولوجيا المعلومات &copy; 2026/2027
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>مطور خصيصاً لتلاميذ مادتي تكنولوجيا المعلومات بمصر والشرق الأوسط</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span>نوع التحميل المتاح: TXT و PDF (عبر نافذة الطباعة)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
