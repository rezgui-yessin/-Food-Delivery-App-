# =======================================================
# Stage 1: Build the Spring Boot Application
# =======================================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy Maven descriptor and fetch dependencies first for Docker layer caching
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy project source code
COPY src ./src

# Build the executable fat JAR without running tests
RUN mvn clean package -DskipTests -B

# =======================================================
# Stage 2: Production Lightweight Runtime Image
# =======================================================
FROM eclipse-temurin:17-jre-alpine

# Set metadata
LABEL maintainer="yessin-rezgui"
LABEL description="Food Delivery API - Production Container"

WORKDIR /app

# Add a dedicated non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built JAR artifact from builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

# Expose API port
EXPOSE 8081

# Container JVM optimization flags:
# - UseContainerSupport: enables Docker cgroup memory awareness
# - MaxRAMPercentage: caps JVM heap at 75% of container RAM limit
# - G1GC: low-pause latency-sensitive garbage collector
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

