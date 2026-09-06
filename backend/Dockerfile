FROM php:8.2-apache

# Enable Apache mod_rewrite for routing
RUN a2enmod rewrite

# Install PostgreSQL PDO extension
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean

# Set working directory
WORKDIR /var/www/html

# Copy all backend files
COPY . .

# Allow .htaccess overrides
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80