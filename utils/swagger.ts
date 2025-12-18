import swaggerJSDoc from "swagger-jsdoc";
import path from "node:path";

const routePath = path.join(__dirname, "../routes/*.ts");
console.log(routePath);

const swaggerDocOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Alokah API Documentation",
      version: "1.0.0",
      description: "Alokah API Documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [routePath],
};

export const swaggerDoc = swaggerJSDoc(swaggerDocOptions);
