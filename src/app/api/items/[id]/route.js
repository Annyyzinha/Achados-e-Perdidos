import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { status, moderatorEmail } = await request.json();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    item.status = status;
    item.validatedBy = moderatorEmail || 'admin.derdi@utfpr.edu.br';
    item.auditTrail.push({
      action: `MUDANCA_STATUS_PARA_${status.toUpperCase()}`,
      performedBy: moderatorEmail || 'admin.derdi@utfpr.edu.br',
      date: new Date()
    });

    await item.save();
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}