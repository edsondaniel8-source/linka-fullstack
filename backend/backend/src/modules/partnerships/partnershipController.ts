import { Request, Response } from 'express';
import { PartnershipService } from './partnershipService';

export class PartnershipController {
  private partnershipService: PartnershipService;

  constructor() {
    this.partnershipService = new PartnershipService();
  }

  public getAvailableProposals = async (req: Request, res: Response): Promise<void> => {
    try {
      const proposals = await this.partnershipService.getAvailableProposals();
      res.json(proposals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getMyProposals = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obter driverId dos headers ou query parameters
      const driverId = req.headers['user-id'] || req.query.userId;
      if (!driverId) {
        res.status(401).json({ error: 'ID do usuário não fornecido' });
        return;
      }
      const proposals = await this.partnershipService.getDriverProposals(driverId as string);
      res.json(proposals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getMyApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const driverId = req.headers['user-id'] || req.query.userId;
      if (!driverId) {
        res.status(401).json({ error: 'ID do usuário não fornecido' });
        return;
      }
      const applications = await this.partnershipService.getDriverApplications(driverId as string);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public acceptProposal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { proposalId } = req.params;
      const driverId = req.headers['user-id'] || req.query.userId;

      if (!driverId) {
        res.status(401).json({ error: 'ID do usuário não fornecido' });
        return;
      }

      const agreement = await this.partnershipService.acceptProposal(proposalId, driverId as string);
      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public rejectProposal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { proposalId } = req.params;
      const driverId = req.headers['user-id'] || req.query.userId;

      if (!driverId) {
        res.status(401).json({ error: 'ID do usuário não fornecido' });
        return;
      }

      const result = await this.partnershipService.rejectProposal(proposalId, driverId as string);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public createProposal = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = req.headers['user-id'] || req.query.userId;
      if (!hotelId) {
        res.status(401).json({ error: 'ID do usuário não fornecido' });
        return;
      }

      const proposal = await this.partnershipService.createProposal(hotelId as string, req.body);
      res.status(201).json(proposal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getHotelProposals = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelId = req.headers['user-id'] || req.query.userId;
      if (!hotelId) {
        res.status(401).json({ error: 'ID do usuário não fornecido' });
        return;
      }

      const proposals = await this.partnershipService.getHotelProposals(hotelId as string);
      res.json(proposals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getProposalApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { proposalId } = req.params;
      const hotelId = req.headers['user-id'] || req.query.userId;

      if (!hotelId) {
        res.status(401).json({ error: 'ID do usuário não fornecido' });
        return;
      }

      // Verificar se a proposta pertence ao hotel
      const proposal = await this.partnershipService.findProposalById(proposalId);
      if (!proposal || proposal.hotelId !== hotelId) {
        res.status(403).json({ error: 'Acesso não autorizado' });
        return;
      }

      const applications = await this.partnershipService.getProposalApplications(proposalId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Método auxiliar para buscar proposta por ID
  private async findProposalById(proposalId: string) {
    return this.partnershipService.findProposalById(proposalId);
  }
}