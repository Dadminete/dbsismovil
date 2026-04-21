import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractSessionUserId } from '@/lib/auth-helpers';

export async function POST(request: Request) {
    try {
        const sessionUserId = await extractSessionUserId();

        if (!sessionUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            tipo,
            monto,
            categoria_id,
            metodo,
            caja_id,
            bank_id,
            cuenta_bancaria_id,
            descripcion,
            fecha
        } = body;

        console.log('Received transaction body:', body);
        const finalUserId = sessionUserId;
        console.log('Using User ID:', finalUserId);
        const amountNum = parseFloat(monto);
        const multiplier = tipo === 'ingreso' ? 1 : -1;
        const offset = amountNum * multiplier;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Insert into movimientos_contables
            const movimiento = await tx.movimientoContable.create({
                data: {
                    tipo,
                    monto: amountNum,
                    categoriaId: categoria_id,
                    metodo,
                    cajaId: caja_id || null,
                    bankId: bank_id || null,
                    cuentaBancariaId: cuenta_bancaria_id || null,
                    descripcion,
                    fecha: fecha ? new Date(fecha) : new Date(),
                    usuarioId: finalUserId
                }
            });

            // 2. Update balances
            if (metodo === 'caja' && caja_id) {
                await tx.caja.update({
                    where: { id: caja_id },
                    data: {
                        saldoActual: {
                            increment: offset
                        }
                    }
                });
            } else if (metodo === 'transferencia' && cuenta_bancaria_id) {
                await tx.cuentaBancaria.update({
                    where: { id: cuenta_bancaria_id },
                    data: {
                        updatedAt: new Date()
                    }
                });
            }

            return movimiento;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error saving transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
