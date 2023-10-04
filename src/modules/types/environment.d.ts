export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_PORT: number
      DB_USER: string
      PORT: number
      HOST: string
      ENV: 'test' | 'dev' | 'prod'
    }
  }
}
