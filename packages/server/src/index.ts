import { startServer } from './server'

const port = Number(process.env.PORT) || 8080
startServer(port)
