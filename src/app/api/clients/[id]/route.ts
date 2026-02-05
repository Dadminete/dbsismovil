import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const res = await query('SELECT * FROM clientes WHERE id = $1', [id]);
        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const client = res.rows[0];

        // Verify local files if it's a local path
        if (client.foto_url && client.foto_url.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', client.foto_url);
            if (!fs.existsSync(filePath)) {
                client.foto_url = null;
            }
        }
        // Vercel Blob URLs don't need local verification

        return NextResponse.json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        let {
            nombre,
            apellidos,
            telefono,
            email,
            direccion,
            fecha_suscripcion,
            sexo,
            foto_url,
            estado
        } = body;

        // Handle base64 photo upload
        if (foto_url && foto_url.startsWith('data:image')) {
            try {
                const base64Data = foto_url.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                const contentType = foto_url.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
                const fileName = `client_${Date.now()}_${id.substring(0, 8)}.jpg`;

                // If Vercel Blob token is available, use it (Cloud)
                if (process.env.BLOB_READ_WRITE_TOKEN) {
                    const blob = await put(fileName, buffer, {
                        access: 'public',
                        contentType
                    });
                    foto_url = blob.url;
                } else {
                    // Fallback to local storage (Development)
                    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const filePath = path.join(uploadDir, fileName);
                    fs.writeFileSync(filePath, buffer);
                    foto_url = `/uploads/${fileName}`;
                }
            } catch (err) {
                console.error('Error saving image:', err);
            }
        }

        const res = await query(
            `UPDATE clientes 
       SET nombre = $1, 
           apellidos = $2, 
           telefono = $3, 
           email = $4, 
           direccion = $5, 
           fecha_suscripcion = $6, 
           sexo = $7, 
           foto_url = $8, 
           estado = $9, 
           updated_at = NOW() 
       WHERE id = $10 
       RETURNING *`,
            [
                nombre,
                apellidos,
                telefono,
                email,
                direccion || null,
                fecha_suscripcion || null,
                sexo || null,
                foto_url || null,
                estado || 'activo',
                id
            ]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
        return NextResponse.json(res.rows[0]);
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
