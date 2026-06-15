FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jdk-alpine
RUN apk add --no-cache gcc musl-dev g++ python3 nodejs npm
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 5001
ENTRYPOINT ["java", "-jar", "app.jar"]