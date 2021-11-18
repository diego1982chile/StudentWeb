# StudentWeb
Frontend para API StudentService

# Setup
Se trata de un proyecto Oracle Jet por lo que se necesita:

- Node.js 5+ y npm
- Para instalar el CLI de Oracle Jet ejecutar el siguiente comando:
```
    npm -g install @oracle/ojet-cli
```
 - Descargar el proyecto desde el repositorio y descomprimir
 - Si se desea visualizar el proyecto mediante un IDE los IDEs recomendados son NetBeans 11+ o Visual Studio Code
 - Sincronizar las dependencias del proyecto. Dirigirse a la raiz del proyecto y ejecutar el siguiente comando:
   
     ojet restore

# Run

Ejecutar el siguiente comando para servir la aplicación utilizando node.js

    ojet serve

# Build

Opcionalmente el proyecto se puede empaquetar en un war (generado en la carpeta /dist) mediante el siguiente comando

    ojet build --release
