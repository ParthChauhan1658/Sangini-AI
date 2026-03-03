package com.example.first

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.telephony.SmsManager
import androidx.core.app.ActivityCompat
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "sms_sender"
    private val CALL_PERMISSION_REQUEST_CODE = 2

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "sendSMS" -> {
                    val phoneNumbers: List<String> = call.argument<List<String>>("phones") ?: listOf()
                    val message: String = call.argument<String>("message") ?: "Emergency Alert!"

                    val sent = sendSms(phoneNumbers, message)
                    if (sent) {
                        result.success("SMS Sent Successfully")
                    } else {
                        result.error("ERROR", "SMS Failed", null)
                    }
                }

                "call" -> {
                    val phoneNumber: String? = call.argument("phone")
                    if (phoneNumber != null) {
                        makePhoneCall(phoneNumber)
                        result.success("Calling $phoneNumber")
                    } else {
                        result.error("ERROR", "Invalid phone number", null)
                    }
                }

                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    private fun sendSms(phoneNumbers: List<String>, message: String): Boolean {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.SEND_SMS), 1)
            return false
        }

        return try {
            val smsManager: SmsManager = SmsManager.getDefault()
            for (phone in phoneNumbers) {
                smsManager.sendTextMessage(phone, null, message, null, null)
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun makePhoneCall(phoneNumber: String) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CALL_PHONE), CALL_PERMISSION_REQUEST_CODE)
            return
        }

        val intent = Intent(Intent.ACTION_CALL)
        intent.data = Uri.parse("tel:$phoneNumber")
        startActivity(intent)
    }
}


