package com.HiredAI.heiredAi.Entity;

import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name="users")
public class UserEntity {

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String userName;
	private String email;
	private String password;
	
	private String firstName;  
    private String lastName;   
    private String mobile; 
    
    private String otp;
    private long otpExpiry; 
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean verified;
   // private String verificationToken;
	@ElementCollection
	@CollectionTable(name = "user_dream_jobs", joinColumns = @JoinColumn(name = "user_id"))
	@Column(name = "dream_job")
	private List<String> dreamJobs;
	 
	
	public boolean isVerified() {
		return verified;
	}
	public List<String> getDreamJobs() {
		return dreamJobs;
	}
	public void setDreamJobs(List<String> dreamJobs) {
		this.dreamJobs = dreamJobs;
	}
	public void setVerified(boolean verified) {
		this.verified = verified;
	}
	
	public String getOtp() {
		return otp;
	}
	public void setOtp(String otp) {
		this.otp = otp;
	}
	public long getOtpExpiry() {
		return otpExpiry;
	}
	public void setOtpExpiry(long otpExpiry) {
		this.otpExpiry = otpExpiry;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public UserEntity(Long id, String userName, String email, String password, String firstName, String lastName,
			String mobile) {
		super();
		this.id = id;
		this.userName = userName;
		this.email = email;
		this.password = password;
		this.firstName = firstName;
		this.lastName = lastName;
		this.mobile = mobile;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getMobile() {
		return mobile;
	}
	public void setMobile(String mobile) {
		this.mobile = mobile;
	}
	public UserEntity() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
	
}
