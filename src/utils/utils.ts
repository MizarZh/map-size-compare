// export function throttle<T extends (...args: any[]) => any>(
//   fn: T,
//   wait = 500,
// ): (...args: Parameters<T>) => void {
//   let timer: NodeJS.Timeout | undefined = undefined;
//   let last: number | undefined;

//   return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
//     const now = Date.now();
//     const timeout = wait; // Using a more descriptive variable name

//     if (last && now < last + timeout) {
//       clearTimeout(timer);
//       timer = setTimeout(() => {
//         last = now;
//         fn.apply(this, args);
//       }, timeout);
//     } else {
//       last = now;
//       fn.apply(this, args);
//     }
//   };
// }
