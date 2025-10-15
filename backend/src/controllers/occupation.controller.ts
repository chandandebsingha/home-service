import { Request, Response } from 'express';
import { OccupationService } from '../services/occupation.service';

export class OccupationController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const created = await OccupationService.create({
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? true,
      });
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to create occupation' });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const occupations = await OccupationService.list();
      res.status(200).json({ success: true, data: occupations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch occupations' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid occupation ID' });
        return;
      }
      const occupation = await OccupationService.getById(id);
      if (!occupation) {
        res.status(404).json({ success: false, error: 'Occupation not found' });
        return;
      }
      res.status(200).json({ success: true, data: occupation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch occupation' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid occupation ID' });
        return;
      }
      const body = req.body;
      const updated = await OccupationService.update(id, {
        name: body.name,
        description: body.description,
        isActive: body.isActive,
      });
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to update occupation' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid occupation ID' });
        return;
      }
      await OccupationService.delete(id);
      res.status(200).json({ success: true, message: 'Occupation deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete occupation' });
    }
  }
}
