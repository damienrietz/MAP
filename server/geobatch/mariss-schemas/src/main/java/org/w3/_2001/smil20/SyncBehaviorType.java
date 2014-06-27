//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vJAXB 2.1.10 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2014.06.13 at 10:49:44 AM CEST 
//


package org.w3._2001.smil20;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlEnumValue;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for syncBehaviorType.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="syncBehaviorType">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="canSlip"/>
 *     &lt;enumeration value="locked"/>
 *     &lt;enumeration value="independent"/>
 *     &lt;enumeration value="default"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "syncBehaviorType")
@XmlEnum
public enum SyncBehaviorType {

    @XmlEnumValue("canSlip")
    CAN_SLIP("canSlip"),
    @XmlEnumValue("locked")
    LOCKED("locked"),
    @XmlEnumValue("independent")
    INDEPENDENT("independent"),
    @XmlEnumValue("default")
    DEFAULT("default");
    private final String value;

    SyncBehaviorType(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static SyncBehaviorType fromValue(String v) {
        for (SyncBehaviorType c: SyncBehaviorType.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}