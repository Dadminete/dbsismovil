'use client';

import React from 'react';

interface InvoicePrintProps {
    invoice: any;
    client: any;
    payments?: any[];
}

const InvoicePrint = React.forwardRef<HTMLDivElement, InvoicePrintProps>(({ invoice, client, payments = [] }, ref) => {
    if (!invoice || !client) return null;

    const totalPaid = payments.reduce((acc, p) => acc + parseFloat(p.monto), 0);
    const balance = parseFloat(invoice.total) - totalPaid;

    return (
        <div className="print-only">
            <style dangerouslySetInnerHTML={{ __html: `
                @media screen {
                    .print-only { display: none; }
                }
                @media print {
                    /* Reset body */
                    body {
                        visibility: hidden;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    /* Show only the receipt */
                    .print-only, .print-only * {
                        visibility: visible;
                    }
                    
                    .print-only {
                        position: absolute;
                        left: 0;
                        top: 0;
                        display: block !important;
                        width: 58mm !important;
                    }

                    @page {
                        margin: 0;
                        size: 58mm auto;
                    }

                    .print-receipt {
                        width: 58mm;
                        padding: 4mm 2mm;
                        box-sizing: border-box;
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 10px;
                        line-height: 1.2;
                        color: #000;
                        background: #fff;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                    .uppercase { text-transform: uppercase; }
                    .divider { border-top: 1px dashed #000; margin: 2mm 0; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 0.5mm; }
                    .header-title { font-size: 12px; font-weight: bold; margin-bottom: 1mm; }
                    .mb-4 { margin-bottom: 4mm; }
                    .mt-2 { margin-top: 2mm; }
                }
            ` }} />
            
            <div ref={ref} className="print-receipt">
                <div className="text-center mb-4">
                    <div className="header-title">Tecnologica Del Este</div>
                    <div className="bold">FACTURA DE PAGO</div>
                </div>

                <div className="mb-4">
                    <div className="bold">{invoice.numero_factura}</div>
                    <div className="info-row">
                        <span>Cliente:</span>
                        <span>{client.nombre} {client.apellidos}</span>
                    </div>
                    <div className="info-row">
                        <span>Servicio:</span>
                        <span>Internet Residencial</span>
                    </div>
                    <div className="info-row">
                        <span>Plan:</span>
                        <span>Plan Basico</span>
                    </div>
                    <div className="info-row">
                        <span>Fecha:</span>
                        <span>{new Date(invoice.fecha_factura).toLocaleDateString()}</span>
                    </div>
                    <div className="info-row">
                        <span>Estado:</span>
                        <span className="uppercase">{invoice.estado}</span>
                    </div>
                </div>

                <div className="bold uppercase">CONCEPTOS</div>
                <div className="divider" style={{ margin: '1mm 0' }}></div>
                
                <div className="mb-4">
                    <div>Internet Residencial - Mes Corriente</div>
                    <div className="info-row">
                        <span>x1</span>
                        <span>RD${parseFloat(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="text-right mt-2">
                    <div className="info-row">
                        <span>Subtotal</span>
                        <span>RD${parseFloat(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="info-row">
                        <span>ITBIS</span>
                        <span>RD$0.00</span>
                    </div>
                    <div className="info-row">
                        <span>Descuento</span>
                        <span>- RD$0.00</span>
                    </div>
                    <div className="divider"></div>
                    <div className="info-row bold" style={{ fontSize: '12px' }}>
                        <span>TOTAL</span>
                        <span>RD${parseFloat(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="info-row">
                        <span>Pendiente</span>
                        <span>RD${balance < 0 ? '0.00' : balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="text-center mt-2" style={{ fontSize: '8px' }}>
                    <div className="divider"></div>
                    <div>Impreso por: Daniel Beras Sanchez</div>
                    <div className="bold mt-2">*** ¡Gracias por su pago! ***</div>
                    <div style={{ marginTop: '2mm' }}>{new Date().toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
});

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;
