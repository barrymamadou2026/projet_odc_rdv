package com.odc.backend_medic.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.List;

/**
 * Vérifie, AVANT même de créer le compte et d'envoyer l'email de
 * confirmation, que le domaine de l'adresse email est capable de recevoir
 * des emails (il possède des enregistrements DNS MX valides).
 *
 * Cela bloque immédiatement les fautes de frappe évidentes et les domaines
 * inexistants (ex: "test@gmial.com", "a@asdkjhasd.xyz") sans attendre que
 * l'utilisateur ne reçoive jamais son email de confirmation.
 *
 * Limite technique honnête : cela ne garantit PAS que la boîte mail précise
 * (ex: "jean.dupont@gmail.com") existe réellement — la plupart des grands
 * fournisseurs (Gmail, Outlook...) acceptent la connexion SMTP pour n'importe
 * quelle boîte afin d'éviter l'énumération d'adresses, donc une vérification
 * SMTP directe ne serait pas fiable. La confirmation ferme et fiable de la
 * PROPRIÉTÉ de l'adresse reste le lien de vérification envoyé par email
 * (double opt-in), déjà en place dans AuthService.
 */
@Slf4j
@Component
public class EmailDomainValidator {

    // Domaines jetables/anti-spam les plus courants — on les bloque aussi car
    // ils ne correspondent jamais à un vrai patient/médecin identifiable.
    private static final List<String> DOMAINES_JETABLES = List.of(
            "mailinator.com", "yopmail.com", "tempmail.com", "temp-mail.org",
            "10minutemail.com", "guerrillamail.com", "trashmail.com", "fakeinbox.com"
    );

    public boolean domaineAcceptable(String email) {
        String domaine = extraireDomaine(email);
        if (domaine == null) return false;

        if (DOMAINES_JETABLES.contains(domaine.toLowerCase())) {
            return false;
        }

        return possedeEnregistrementMx(domaine);
    }

    private String extraireDomaine(String email) {
        int at = email.lastIndexOf('@');
        if (at < 0 || at == email.length() - 1) return null;
        return email.substring(at + 1).trim();
    }

    private boolean possedeEnregistrementMx(String domaine) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
        env.put("com.sun.jndi.dns.timeout.initial", "3000"); // 3s, pour ne pas bloquer l'inscription en cas de DNS lent
        env.put("com.sun.jndi.dns.timeout.retries", "1");

        try {
            InitialDirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(domaine, new String[]{"MX"});
            Attribute mx = attrs.get("MX");
            if (mx != null && mx.size() > 0) {
                return true;
            }
            // Certains petits domaines n'ont pas de MX mais acceptent le mail sur leur enregistrement A/AAAA.
            Attributes attrsA = ctx.getAttributes(domaine, new String[]{"A"});
            return attrsA.get("A") != null;
        } catch (NamingException e) {
            log.warn("Vérification DNS impossible pour le domaine '{}': {}", domaine, e.getMessage());
            // En cas de souci réseau/DNS temporaire côté serveur, on ne bloque pas
            // l'inscription pour une adresse par ailleurs valide syntaxiquement.
            return true;
        }
    }
}
