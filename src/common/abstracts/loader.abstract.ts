// import { Injectable } from '@nestjs/common';
// import DataLoader from 'dataloader';
// import { AbstractRepository } from './repository.abstract';
// import { AbstractService } from './service.abstract';

// @Injectable()
// export abstract class AbstractLoader<
//   T extends { id: number },
//   R extends AbstractService<T, AbstractRepository<T>>,
// > {
//   private singleLoader: DataLoader<number, T>;
//   private multipleLoaders: Map<string, DataLoader<number, T[]>> = new Map();

//   constructor(protected readonly service: R) {
//     this.initializeLoaders();
//   }

//   private initializeLoaders() {
//     this.singleLoader = new DataLoader<number, T>(async (keys) => {
//       const results = await this.service.getByIds([...keys]);
//       const resultMap = new Map(results.map((item) => [item.id, item]));
//       return keys.map((key) => resultMap.get(key));
//     });
//   }

//   private getMultipleLoader(key: keyof T): DataLoader<number, T[]> {
//     if (!this.multipleLoaders.has(key as string)) {
//       this.multipleLoaders.set(
//         key as string,
//         new DataLoader<number, T[]>(async (keys) => {
//           const results = await this.service.getMany({
//             [key]: [...keys],
//           });

//           const resultMap = new Map<number, T[]>();
//           results.forEach((item) => {
//             const keyValue = item[key] as number;
//             if (!resultMap.has(keyValue)) {
//               resultMap.set(keyValue, []);
//             }
//             resultMap.get(keyValue)?.push(item);
//           });

//           return keys.map((key) => resultMap.get(key) || []);
//         }),
//       );
//     }
//     return this.multipleLoaders.get(key as string);
//   }

//   get single() {
//     return this.singleLoader;
//   }

//   multiple(key: keyof T) {
//     return this.getMultipleLoader(key);
//   }
// }
