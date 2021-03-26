export {};

declare global {
  const MY_ENV_VAR: string
  const MY_SECRET: string
  const IMG_QUEUE: KVNamespace
  const CALLED: KVNamespace
}
