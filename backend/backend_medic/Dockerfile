# --- Build stage ---
FROM maven:3-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# AJOUT DES OPTIONS -D POUR LE POOL DE CONNEXION CLEVER CLOUD
ENTRYPOINT ["java", "-Dspring.datasource.hikari.connection-timeout=30000", "-Dspring.datasource.hikari.maximum-pool-size=5", "-jar", "app.jar"]