package utils

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)


func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func GenerateToken(id uint, role string) (string, error) {
	secretKey := []byte("YXlQrZHFWD2bBn5sJpSuhSF5sBIWIx4r")

	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["exp"] = time.Now().Add(time.Hour * 1).Unix()
	claims["iat"] = time.Now().Unix()
	claims["role"] = role
	claims["id"] = id

	signedToken, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

func AuthenticateUser(authHeader string) (bool, string, uint, error) {
	secretKey := []byte(os.Getenv("SECRET_KEY"))
	if authHeader == "" {
		return false, "", 0, fmt.Errorf("Unauthorized")
	}

	token, err := extractToken(authHeader)
	if err != nil {
		return false, "", 0, err
	}

	parsedToken, err := jwt.Parse(token, func (token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, fmt.Errorf("Unauthorized")
		}

		return secretKey, nil
	})

	if err != nil {
		return false, "", 0, err
	}
	
	if parsedToken.Valid {
		claims := parsedToken.Claims.(jwt.MapClaims)
		return true, claims["role"].(string), uint(claims["id"].(float64)), nil
	} else if ve, ok := err.(*jwt.ValidationError); ok {
		if ve.Errors&jwt.ValidationErrorExpired != 0 {
			return true, "", 0, fmt.Errorf("Token has expired")
		}
	}

	return false, "", 0, fmt.Errorf("Unauthorized")
}

func extractToken(authHeader string) (string, error) {
	const bearerPrefix = "Bearer "
	if strings.HasPrefix(authHeader, bearerPrefix) {
		token := strings.TrimPrefix(authHeader, bearerPrefix)
		return token, nil
	}
	return "", fmt.Errorf("Invalid Authorization header format")
}