package com.odc.backend_medic.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;

/**
 * Implémentation minimale de la signature AWS Signature Version 4, utilisée
 * pour appeler l'API AWS SES (Simple Email Service) en HTTP direct sans
 * dépendre du SDK AWS complet (évite d'alourdir le projet avec des dizaines
 * de dépendances pour un seul appel API).
 *
 * Référence : https://docs.aws.amazon.com/general/latest/gr/sigv4-signing-with-aws-sigv4.html
 */
public final class AwsSignatureV4 {

    private static final DateTimeFormatter AMZ_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter DATE_STAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);

    private AwsSignatureV4() {
    }

    public record SignedHeaders(String amzDate, String authorization, String payloadHash) {
    }

    public static SignedHeaders sign(String method, String host, String uriPath, String region,
                                      String service, String accessKey, String secretKey,
                                      String payload) {
        try {
            Instant now = Instant.now();
            String amzDate = AMZ_DATE_FORMAT.format(now);
            String dateStamp = DATE_STAMP_FORMAT.format(now);

            String payloadHash = sha256Hex(payload);

            String canonicalHeaders = "content-type:application/json\n"
                    + "host:" + host + "\n"
                    + "x-amz-date:" + amzDate + "\n";
            String signedHeadersList = "content-type;host;x-amz-date";

            String canonicalRequest = method + "\n"
                    + uriPath + "\n"
                    + "" + "\n"
                    + canonicalHeaders + "\n"
                    + signedHeadersList + "\n"
                    + payloadHash;

            String credentialScope = dateStamp + "/" + region + "/" + service + "/aws4_request";
            String stringToSign = "AWS4-HMAC-SHA256\n"
                    + amzDate + "\n"
                    + credentialScope + "\n"
                    + sha256Hex(canonicalRequest);

            byte[] signingKey = getSignatureKey(secretKey, dateStamp, region, service);
            String signature = HexFormat.of().formatHex(hmacSha256(signingKey, stringToSign));

            String authorization = "AWS4-HMAC-SHA256 "
                    + "Credential=" + accessKey + "/" + credentialScope + ", "
                    + "SignedHeaders=" + signedHeadersList + ", "
                    + "Signature=" + signature;

            return new SignedHeaders(amzDate, authorization, payloadHash);
        } catch (Exception e) {
            throw new RuntimeException("Échec de la signature AWS SigV4", e);
        }
    }

    private static byte[] hmacSha256(byte[] key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    private static byte[] getSignatureKey(String secretKey, String dateStamp, String region, String service) throws Exception {
        byte[] kSecret = ("AWS4" + secretKey).getBytes(StandardCharsets.UTF_8);
        byte[] kDate = hmacSha256(kSecret, dateStamp);
        byte[] kRegion = hmacSha256(kDate, region);
        byte[] kService = hmacSha256(kRegion, service);
        return hmacSha256(kService, "aws4_request");
    }

    private static String sha256Hex(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
