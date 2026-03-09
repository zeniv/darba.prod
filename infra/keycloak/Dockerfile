FROM quay.io/keycloak/keycloak:23.0

# keycloak-russian-providers (VK, OK, Yandex, Mail.ru)
# https://github.com/playa-ru/keycloak-russian-providers
ARG KRP_VERSION=1.0.42
ADD --chown=keycloak:keycloak https://repo1.maven.org/maven2/ru/playa/keycloak/keycloak-russian-providers/${KRP_VERSION}/keycloak-russian-providers-${KRP_VERSION}.jar /opt/keycloak/providers/keycloak-russian-providers.jar
ADD --chown=keycloak:keycloak https://repo1.maven.org/maven2/com/jayway/jsonpath/json-path/2.7.0/json-path-2.7.0.jar /opt/keycloak/providers/json-path.jar
ADD --chown=keycloak:keycloak https://repo1.maven.org/maven2/net/minidev/json-smart/2.4.7/json-smart-2.4.7.jar /opt/keycloak/providers/json-smart.jar

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--import-realm"]
