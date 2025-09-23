import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../../../../lib/cloudinary';

// Simple auth check - in production, use proper JWT/session management
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  return token === process.env.ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const landingPages = await prisma.landingPage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: landingPages });
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, imageUrl, imageAlt, buttonText, footerText, imageFile } = body;

    let finalImageUrl = imageUrl;

    // If a new image file is provided, upload to Cloudinary
    if (imageFile) {
      try {
        const uploadResult = await uploadToCloudinary(imageFile);
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image' },
          { status: 400 }
        );
      }
    }

    // Deactivate all existing landing pages
    await prisma.landingPage.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new landing page
    const landingPage = await prisma.landingPage.create({
      data: {
        title,
        description,
        imageUrl: finalImageUrl,
        imageAlt: imageAlt || 'Landing page image',
        buttonText,
        footerText: footerText || 'Note: Forecasts are approximate and may vary with local weather and light pollution.',
        isActive: true
      }
    });

    return NextResponse.json({ success: true, data: landingPage });
  } catch (error) {
    console.error('Error creating landing page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create landing page' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, imageUrl, imageAlt, buttonText, footerText, imageFile } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Landing page ID is required' },
        { status: 400 }
      );
    }

    const existingLandingPage = await prisma.landingPage.findUnique({
      where: { id }
    });

    if (!existingLandingPage) {
      return NextResponse.json(
        { success: false, error: 'Landing page not found' },
        { status: 404 }
      );
    }

    let finalImageUrl = imageUrl;

    // If a new image file is provided, upload to Cloudinary
    if (imageFile) {
      try {
        // Delete old image if it's from Cloudinary
        if (existingLandingPage.imageUrl.includes('cloudinary.com')) {
          const oldPublicId = extractPublicIdFromUrl(existingLandingPage.imageUrl);
          if (oldPublicId) {
            await deleteFromCloudinary(oldPublicId);
          }
        }

        const uploadResult = await uploadToCloudinary(imageFile);
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image' },
          { status: 400 }
        );
      }
    }

    // Update landing page
    const updatedLandingPage = await prisma.landingPage.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl: finalImageUrl,
        imageAlt: imageAlt || existingLandingPage.imageAlt,
        buttonText,
        footerText: footerText || existingLandingPage.footerText || 'Note: Forecasts are approximate and may vary with local weather and light pollution.',
        updatedAt: new Date()
      }
    });

    // If this page is being activated, deactivate others
    if (body.isActive && !existingLandingPage.isActive) {
      await prisma.landingPage.updateMany({
        where: { 
          id: { not: id },
          isActive: true 
        },
        data: { isActive: false }
      });

      await prisma.landingPage.update({
        where: { id },
        data: { isActive: true }
      });
    }

    return NextResponse.json({ success: true, data: updatedLandingPage });
  } catch (error) {
    console.error('Error updating landing page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update landing page' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Landing page ID is required' },
        { status: 400 }
      );
    }

    const landingPage = await prisma.landingPage.findUnique({
      where: { id }
    });

    if (!landingPage) {
      return NextResponse.json(
        { success: false, error: 'Landing page not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it exists
    if (landingPage.imageUrl.includes('cloudinary.com')) {
      const publicId = extractPublicIdFromUrl(landingPage.imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Delete landing page
    await prisma.landingPage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Landing page deleted successfully' });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete landing page' },
      { status: 500 }
    );
  }
}