package com.neurofleetx.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        JavaTimeModule module = new JavaTimeModule();
        
        // Custom deserializer that handles ISO-8601 with milliseconds and timezone
        DateTimeFormatter formatter = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd'T'HH:mm:ss")
            .optionalStart()
            .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
            .optionalEnd()
            .optionalStart()
            .appendPattern("XXX")
            .optionalEnd()
            .optionalStart()
            .appendPattern("'Z'")
            .optionalEnd()
            .toFormatter();
        
        LocalDateTimeDeserializer localDateTimeDeserializer = new LocalDateTimeDeserializer(formatter);
        LocalDateTimeSerializer localDateTimeSerializer = new LocalDateTimeSerializer(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        
        module.addDeserializer(LocalDateTime.class, localDateTimeDeserializer);
        module.addSerializer(LocalDateTime.class, localDateTimeSerializer);
        
        return Jackson2ObjectMapperBuilder.json()
            .modules(module)
            .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .featuresToDisable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE)
            .build();
    }
}
