import { Request, Response } from 'express';
import { ServiceService } from '../services/service.service';

export class ServicesController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const created = await ServiceService.create({
        name: body.name,
        description: body.description,
        price: body.price,
        serviceType: body.serviceType,
        categoryId: body.categoryId,
        serviceTypeId: body.serviceTypeId,
        durationMinutes: body.durationMinutes,
        availability: body.availability ?? true,
        timeSlots: body.timeSlots,
      });
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create service' });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 100);
      const offset = parseInt(String(req.query.offset ?? '0'), 10) || 0;
      const categoryId = req.query.categoryId ? parseInt(String(req.query.categoryId), 10) : undefined;
      const serviceTypeId = req.query.serviceTypeId ? parseInt(String(req.query.serviceTypeId), 10) : undefined;
      const items = await ServiceService.list(limit, offset, { categoryId, serviceTypeId });
      res.status(200).json({ success: true, data: items });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list services' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      const item = await ServiceService.getById(id);
      if (!item) {
        res.status(404).json({ success: false, error: 'Service not found' });
        return;
      }
      res.status(200).json({ success: true, data: item });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to get service' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      const body = req.body;
      const updated = await ServiceService.update(id, {
        name: body.name,
        description: body.description,
        price: body.price,
        serviceType: body.serviceType,
        categoryId: body.categoryId,
        serviceTypeId: body.serviceTypeId,
        durationMinutes: body.durationMinutes,
        availability: body.availability,
        timeSlots: body.timeSlots,
      });
      if (!updated) {
        res.status(404).json({ success: false, error: 'Service not found' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update service' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      const deleted = await ServiceService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Service not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete service' });
    }
  }
}
