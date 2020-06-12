/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.views.text;

import android.content.res.AssetManager;
import android.graphics.Typeface;
import android.text.TextUtils;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.ReadableArray;
import java.util.ArrayList;
import java.util.List;

public class ReactTypefaceUtils {
  public static final int UNSET = -1;

  public static int parseFontWeight(@Nullable String fontWeightString) {
    int fontWeightNumeric =
        fontWeightString != null ? parseNumericFontWeight(fontWeightString) : UNSET;
    int fontWeight = fontWeightNumeric != UNSET ? fontWeightNumeric : Typeface.NORMAL;

    if ("bold".equals(fontWeightString)) fontWeight = Typeface.BOLD;
    else if ("normal".equals(fontWeightString)) fontWeight = Typeface.NORMAL;

    return fontWeight;
  }

  public static int parseFontStyle(@Nullable String fontStyleString) {
    int fontStyle = UNSET;
    if ("italic".equals(fontStyleString)) {
      fontStyle = Typeface.ITALIC;
    } else if ("normal".equals(fontStyleString)) {
      fontStyle = Typeface.NORMAL;
    }

    return fontStyle;
  }

  public static @Nullable String parseFontVariant(@Nullable ReadableArray fontVariantArray) {
    if (fontVariantArray == null || fontVariantArray.size() == 0) {
      return null;
    }

    List<String> features = new ArrayList<>();
    for (int i = 0; i < fontVariantArray.size(); i++) {
      // see https://docs.microsoft.com/en-us/typography/opentype/spec/featurelist
      String fontVariant = fontVariantArray.getString(i);
      if (fontVariant != null) {
        switch (fontVariant) {
          case "small-caps":
            features.add("'smcp'");
            break;
          case "oldstyle-nums":
            features.add("'onum'");
            break;
          case "lining-nums":
            features.add("'lnum'");
            break;
          case "tabular-nums":
            features.add("'tnum'");
            break;
          case "proportional-nums":
            features.add("'pnum'");
            break;
        }
      }
    }

    return TextUtils.join(", ", features);
  }

  public static Typeface applyStyles(
      @Nullable Typeface typeface,
      int style,
      int weight,
      @Nullable String family,
      AssetManager assetManager) {
    int oldStyle;
    if (typeface == null) {
      oldStyle = Typeface.NORMAL;
    } else {
      oldStyle = typeface.getStyle();
    }

    int newStyle = oldStyle;
    boolean italic = false;
    if(weight == UNSET) weight = 400;
    if(style == Typeface.ITALIC) italic = true;
    if (weight == Typeface.BOLD) {
      newStyle = (newStyle == Typeface.ITALIC) ? Typeface.BOLD_ITALIC : Typeface.BOLD;
      typeface = Typeface.create(typeface, newStyle);
    } 
    if (weight == Typeface.NORMAL) {
      typeface = Typeface.create(typeface, Typeface.NORMAL);
      newStyle = Typeface.NORMAL;
    }
    if (style == Typeface.ITALIC) {
      newStyle = (newStyle == Typeface.BOLD) ? Typeface.BOLD_ITALIC : Typeface.ITALIC;
      typeface = Typeface.create(typeface, newStyle);
    }
    if(weight > Typeface.BOLD_ITALIC) {
      typeface = Typeface.create(typeface, weight, italic);
    }
    if (family != null) {
      typeface = ReactFontManager.getInstance().getTypeface(family, newStyle, weight, assetManager);
    }
    return typeface;
  }

  /**
   * Return -1 if the input string is not a valid numeric fontWeight (100, 200, ..., 900), otherwise
   * return the weight.
   */
  private static int parseNumericFontWeight(String fontWeightString) {
    // This should be much faster than using regex to verify input and Integer.parseInt
    return fontWeightString.length() == 3
            && fontWeightString.endsWith("00")
            && fontWeightString.charAt(0) <= '9'
            && fontWeightString.charAt(0) >= '1'
        ? 100 * (fontWeightString.charAt(0) - '0')
        : UNSET;
  }
}
