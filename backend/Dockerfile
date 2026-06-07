# ================================================================
# Meca-PRO API — Multi-stage Dockerfile
# Stage 1: Maven build
# Stage 2: JRE 21 slim runtime
# ================================================================

# --- Stage 1: Build ---
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Copiar POM primero para aprovechar cache de capas
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copiar código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests -q

# --- Stage 2: Runtime ---
FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

# Usuario no-root para seguridad
RUN groupadd -r mecapro && useradd -r -g mecapro mecapro
USER mecapro

# Copiar el JAR
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
