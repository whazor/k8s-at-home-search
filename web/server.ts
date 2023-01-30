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

    // /k8s-at-home-search/hr/data-*.json => dist/static/hr/data-*.json
    app.use("/k8s-at-home-search/hr/data-:id.json", (req, res) => {
        const id = req.params.id;
        // if not number
        if (id.match(/[^0-9]/)) {
            res.status(404).end();
            return;
        }
        const file = path.join(__dirname, "dist", "static", "hr", `data-${id}.json`);
        console.log(file);
        const data = fs.readFileSync(file, "utf-8");
        res.status(200).set({ 'Content-Type': 'application/json' }).end(data);
    });

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const url = req.originalUrl

        try {
            const transformed = await vite.transformIndexHtml(url, template);
            const html = await renderer.generatePage(url, transformed);

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
