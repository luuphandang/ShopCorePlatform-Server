import { Controller } from '@nestjs/common';

import { AbstractEvents } from '@/common/abstracts/events.abstract';
import { EventContext } from '@/common/contexts';

@Controller()
export class AppointmentEventsController extends AbstractEvents {
  constructor(eventContext: EventContext) {
    super(eventContext);
  }
}
