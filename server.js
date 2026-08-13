/**
 * BIBAZ — Hostinger Entry Point (server.js)
 * SOP §৮.৫ — Custom server for Hostinger Node.js deployment
 * 
 * Rules:
 * - This file runs in PRODUCTION only
 * - Build happens on GitHub Actions (7GB RAM), NOT on Hostinger
 * - Hostinger only runs: node server.js
 * - Graceful shutdown on SIGTERM
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false; // Always production on Hostinger
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });

    server.listen(port, hostname, () => {
        console.log(`> BIBAZ server running on http://${hostname}:${port}`);
        console.log(`> Environment: production`);
        console.log(`> Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    });

    // Graceful shutdown (SOP §৮.৫)
    const gracefulShutdown = (signal) => {
        console.log(`> Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log("> Server closed.");
            process.exit(0);
        });

        // Force close after 10 seconds
        setTimeout(() => {
            console.error("> Forced shutdown after timeout.");
            process.exit(1);
        }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
});

