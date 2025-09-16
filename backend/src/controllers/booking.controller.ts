import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class BookingController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const body = req.body;

      if (!Number.isFinite(Number(body.serviceId))) {
        res.status(400).json({ success: false, error: 'Invalid serviceId' });
        return;
      }
      const exists = await BookingService.ensureServiceExists(Number(body.serviceId));
      if (!exists) {
        res.status(404).json({ success: false, error: 'Service not found' });
        return;
      }

      const created = await BookingService.create({
        userId: user.userId,
        serviceId: Number(body.serviceId),
        date: String(body.date || ''),
        time: String(body.time || ''),
        address: String(body.address || ''),
        specialInstructions: body.specialInstructions ? String(body.specialInstructions) : null as any,
        price: Number(body.price || 0),
        status: 'upcoming',
      } as any);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create booking' });
    }
  }

  static async listMine(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const rows = await BookingService.listByUser(user.userId);
      res.status(200).json({ success: true, data: rows });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch bookings' });
    }
  }
}
