import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { Renderer } from './renderer'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))

const toAbsolute = (p: string) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('index.html'), 'utf-8')

async function createServer() {
    const app = express()

    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
    })

    const renderer = new Renderer();
    await renderer.prepareData();

    // use vite's connect instance as middleware
    // if you use your own express router (express.Router()), you should use router.use
    app.use(vite.middlewares)

    // /hr/data-*.json => dist/static/hr/data-*.json
    app.use("/hr/data-:id.json", (req, res) => {
        const id = parseInt(req.params.id);
        if (id in renderer.jsonFilesData) {
            // input is already json stringified
            // res.json(renderer.jsonFilesData[id]);
            res.status(200).header('Content-Type', 'application/json').send(renderer.jsonFilesData[id]);
        } else {
            res.status(404).end();
        }
    });

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const url = req.originalUrl

        try {
            const transformed = await vite.transformIndexHtml(url, template);
            const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
            const html = await renderer.generatePage(render, url, transformed);

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            // If an error is caught, let Vite fix the stack trace so it maps back to
            // your actual source code.
            vite.ssrFixStacktrace(e as Error)
            next(e)
        }
    })

    app.listen(5173)
}

createServer()
