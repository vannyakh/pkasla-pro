import httpStatus from 'http-status';
import crypto from 'crypto';
import { AppError } from '@/common/errors/app-error';
import { guestRepository } from '@/modules/guests/guest.repository';
import { eventService } from '@/modules/events/event.service';
import { templateRepository } from '@/modules/t/template.repository';
import type { GuestStatus } from '@/modules/guests/guest.model';

export interface InviteRenderData {
  event: any;
  guest: any;
  template: any;
  assets: {
    images: Record<string, string>;
    colors: Record<string, string>;
    fonts: Record<string, string>;
  };
}

export class InviteService {
  /**
   * Get invitation data by token for rendering
   */
  async getInviteData(token: string): Promise<InviteRenderData> {
    const guest = await guestRepository.findByInviteToken(token);
    if (!guest) {
      throw new AppError('Invitation not found or invalid token', httpStatus.NOT_FOUND);
    }

    let eventId: string;
    if (typeof guest.eventId === 'string') {
      eventId = guest.eventId;
    } else {
      const eventIdObj = guest.eventId as any;
      eventId = eventIdObj?._id?.toString() || eventIdObj?.id?.toString() || '';
    }
    if (!eventId) {
      throw new AppError('Invalid event ID', httpStatus.INTERNAL_SERVER_ERROR);
    }
    const event = await eventService.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    // Get template if event has one selected
    let template = null;
    if (event.templateSlug) {
      template = await templateRepository.findBySlug(event.templateSlug);
    }

    // Merge assets from template and user customization
    const assets = {
      images: {} as Record<string, string>,
      colors: {} as Record<string, string>,
      fonts: {} as Record<string, string>,
    };

    if (template?.assets) {
      // Add template default assets
      if (template.assets.images) {
        template.assets.images.forEach((img, idx) => {
          assets.images[`default_${idx}`] = img;
        });
      }
      if (template.assets.colors) {
        template.assets.colors.forEach((color, idx) => {
          assets.colors[`default_${idx}`] = color;
        });
      }
      if (template.assets.fonts) {
        template.assets.fonts.forEach((font, idx) => {
          assets.fonts[`default_${idx}`] = font;
        });
      }
    }

    // Override with user customizations
    if (event.userTemplateConfig) {
      if (event.userTemplateConfig.images) {
        Object.assign(assets.images, event.userTemplateConfig.images);
      }
      if (event.userTemplateConfig.colors) {
        Object.assign(assets.colors, event.userTemplateConfig.colors);
      }
      if (event.userTemplateConfig.fonts) {
        Object.assign(assets.fonts, event.userTemplateConfig.fonts);
      }
    }

    return {
      event,
      guest,
      template,
      assets,
    };
  }

  /**
   * Track invitation open (via tracking pixel)
   */
  async trackOpen(token: string): Promise<void> {
    const guest = await guestRepository.findByInviteToken(token);
    if (!guest) {
      return; // Silently fail for tracking
    }

    const guestId = typeof guest._id === 'string' ? guest._id : guest._id.toString();
    if (!guest.openedAt) {
      await guestRepository.updateById(guestId, { openedAt: new Date() });
    }
  }

  /**
   * Track invitation click
   */
  async trackClick(token: string): Promise<void> {
    const guest = await guestRepository.findByInviteToken(token);
    if (!guest) {
      return; // Silently fail for tracking
    }

    const guestId = typeof guest._id === 'string' ? guest._id : guest._id.toString();
    if (!guest.clickedAt) {
      await guestRepository.updateById(guestId, { clickedAt: new Date() });
    }
  }

  /**
   * Submit RSVP
   */
  async submitRSVP(token: string, status: GuestStatus, message?: string): Promise<any> {
    const guest = await guestRepository.findByInviteToken(token);
    if (!guest) {
      throw new AppError('Invitation not found or invalid token', httpStatus.NOT_FOUND);
    }

    const guestId = typeof guest._id === 'string' ? guest._id : guest._id.toString();
    const updateData: any = { status };
    if (message) {
      updateData.notes = message;
    }

    const updated = await guestRepository.updateById(guestId, updateData);
    return updated;
  }

  /**
   * Regenerate invite token for a guest
   */
  async regenerateToken(guestId: string, hostId: string): Promise<string> {
    const guest = await guestRepository.findById(guestId);
    if (!guest) {
      throw new AppError('Guest not found', httpStatus.NOT_FOUND);
    }

    // Verify host owns the event
    let eventId: string;
    if (typeof guest.eventId === 'string') {
      eventId = guest.eventId;
    } else {
      const eventIdObj = guest.eventId as any;
      eventId = eventIdObj?._id?.toString() || eventIdObj?.id?.toString() || '';
    }
    if (!eventId) {
      throw new AppError('Invalid event ID', httpStatus.INTERNAL_SERVER_ERROR);
    }
    const event = await eventService.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', httpStatus.NOT_FOUND);
    }

    const eventHostId = typeof event.hostId === 'string' ? event.hostId : event.hostId.id;
    if (eventHostId !== hostId) {
      throw new AppError('You can only regenerate tokens for your own event guests', httpStatus.FORBIDDEN);
    }

    // Generate new token
    const newToken = crypto.randomBytes(32).toString('base64url');
    await guestRepository.updateById(guestId, { inviteToken: newToken });
    return newToken;
  }
}

export const inviteService = new InviteService();

