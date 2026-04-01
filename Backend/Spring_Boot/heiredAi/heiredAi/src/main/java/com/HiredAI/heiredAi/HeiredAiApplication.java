package com.HiredAI.heiredAi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class HeiredAiApplication {

	public static void main(String[] args) {
		// Prefer IPv4 sockets for SMTP to avoid IPv6-mapped route issues on some networks.
		System.setProperty("java.net.preferIPv4Stack", "true");
		System.setProperty("java.net.preferIPv6Addresses", "false");
		SpringApplication.run(HeiredAiApplication.class, args);
	}

}
