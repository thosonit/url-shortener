package it.thoson.GoURL.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GoURL API")
                        .version("1.0.0")
                        .description("URL shortener API — create, manage, and track short links")
                        .contact(new Contact()
                                .name("thoson.it")
                                .email("thoson.it@gmail.com"))
                        .license(new License()
                                .name("Apache 2.0")));
    }
}