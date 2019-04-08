export async function asyncForEach<T>(
  array: Array<T>,
  callback: (x: T, index: number, array: Array<T>) => Promise<void>
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
