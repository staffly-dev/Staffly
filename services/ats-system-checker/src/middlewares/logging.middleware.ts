import { Request, Response, NextFunction } from "express";

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start_time = Date.now();

  // Extract request information
  const method = req.method;
  const url = req.url;
  const client_ip = req.ip || req.socket.remoteAddress || "unknown";
  const user_agent = req.headers["user-agent"] || "unknown";

  // Log incoming request
  console.log(`${method} ${url} - IP: ${client_ip}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const process_time = (Date.now() - start_time) / 1000;
    const status_code = res.statusCode;

    console.log(`${method} ${url} - ${status_code} - ${process_time.toFixed(3)}s`);

    // Add custom headers only if headers haven't been sent yet
    if (!res.headersSent) {
      try {
        res.setHeader("X-Process-Time", process_time.toString());
      } catch (error) {
        // Headers already sent, ignore
      }
    }

    // Call original end
    originalEnd.call(this, chunk, encoding);
    return res;
  };

  next();
}

