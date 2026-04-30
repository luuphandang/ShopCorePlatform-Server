import 'reflect-metadata';

export const ALLOW_HTML_KEY = Symbol('ALLOW_HTML');

export const AllowHtml = (): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    const existingFields: (string | symbol)[] =
      Reflect.getMetadata(ALLOW_HTML_KEY, target.constructor) ?? [];
    Reflect.defineMetadata(ALLOW_HTML_KEY, [...existingFields, propertyKey], target.constructor);
  };
};

export const getAllowHtmlFields = (cls: new (...args: never[]) => unknown): (string | symbol)[] => {
  return Reflect.getMetadata(ALLOW_HTML_KEY, cls) ?? [];
};
