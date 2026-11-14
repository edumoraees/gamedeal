# Build multi-stage: compila com Maven e roda só com o JRE (imagem final menor).
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 gamedeal && mkdir -p /data/images && chown gamedeal /data/images
COPY --from=build /workspace/target/*.jar /app/app.jar
USER gamedeal
ENV JAVA_OPTS="-Xms128m -Xmx320m"
EXPOSE 8082
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
