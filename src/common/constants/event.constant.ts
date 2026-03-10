export const ENTITIES = Object.freeze({
  address: 'address',
  appointment: 'appointment',
  blog: 'blog',
  booking: 'booking',
  cart: 'cart',
  category: 'category',
  conversion_unit: 'conversion_unit',
  file_upload: 'file_upload',
  order_detail: 'order_detail',
  order_history: 'order_history',
  order_shipping: 'order_shipping',
  order: 'order',
  permission: 'permission',
  product_attribute_value: 'product_attribute_value',
  product_attribute: 'product_attribute',
  product_review: 'product_review',
  product_variant: 'product_variant',
  product: 'product',
  role: 'role',
  unit: 'unit',
  user: 'user',
});

export const ACTIONS = Object.freeze({
  create: 'create',
  update: 'update',
  delete: 'delete',

  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
});

export const EVENTS = Object.freeze({
  publish: 'publish',
  request: 'request',
});

type EntityKeys = keyof typeof ENTITIES;
type ActionKeys = keyof typeof ACTIONS;
type EventKeys = keyof typeof EVENTS;

type RabbitMQEventsStructure = {
  [K in EventKeys]: {
    [E in EntityKeys]: {
      [A in ActionKeys]: string;
    };
  };
};

export const RABBITMQ_EVENTS: RabbitMQEventsStructure = Object.values(EVENTS).reduce(
  (acc, event) => {
    acc[event] = Object.values(ENTITIES).reduce(
      (acc, entity) => {
        acc[entity] = Object.values(ACTIONS).reduce(
          (acc, action) => {
            acc[action] = `${event}.${entity}.${action}`;
            return acc;
          },
          {} as { [A in ActionKeys]: string },
        );
        return acc;
      },
      {} as { [E in EntityKeys]: { [A in ActionKeys]: string } },
    );
    return acc;
  },
  {} as RabbitMQEventsStructure,
);

export const EVENT_TOPICS = RABBITMQ_EVENTS;
