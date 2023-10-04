import path from 'node:path'
import { fileURLToPath } from 'node:url'
const getDirName = (moduleUrl: string): string => path.dirname(fileURLToPath(moduleUrl))
// notis: moduleUrl = import.meta.url

export { getDirName }
