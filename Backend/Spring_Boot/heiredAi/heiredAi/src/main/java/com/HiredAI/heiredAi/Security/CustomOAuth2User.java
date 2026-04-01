package com.HiredAI.heiredAi.Security;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oauth2User;
    private final String provider;

    public CustomOAuth2User(OAuth2User oauth2User, String provider) {
        this.oauth2User = oauth2User;
        this.provider = provider;
    }

    @Override
    public String getName() {
    	System.out.println("provider is:"+provider);
        if (provider.equals("google")) {
            return oauth2User.getAttribute("name");
        }
        if (provider.equals("github")) {
            return oauth2User.getAttribute("login");
        }
        
            String name = oauth2User.getAttribute("name");
            if (name != null) return name;

            String given = oauth2User.getAttribute("given_name");
            String family = oauth2User.getAttribute("family_name");
            if (given != null && family != null) {
                return given + " " + family;
            }

            return oauth2User.getName(); // fallback (sub)
        

      //  return "User";
    }

    public String getEmail() {
        Object email = oauth2User.getAttribute("email");
        if (email != null) return email.toString();

        if (provider.equals("github")) {
            return oauth2User.getAttribute("login") + "@github-user.com";
        }

        if (provider.equals("linkedin")) {
            Object username = oauth2User.getAttribute("name");
            if (username != null) {
                return username + "@linkedin-user.com";
            }
        }

        return oauth2User.getName() + "@oauth-user.com";
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oauth2User.getAuthorities();
    }
}
